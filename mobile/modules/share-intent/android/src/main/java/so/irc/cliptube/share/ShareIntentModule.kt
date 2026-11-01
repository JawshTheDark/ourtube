package so.irc.cliptube.share

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.DocumentsContract
import android.provider.OpenableColumns
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Videos shared to OurTube from another app's share sheet (ACTION_SEND / ACTION_SEND_MULTIPLE with a video type, and text
 * so a shared link gets an explanation).
 * The app reads the share with getShared() when it starts, and gets "onShare" when one arrives while it runs;
 * clear() marks it handled so it isn't picked up again. Files stay where they are (content:// URIs): the upload
 * streams them, nothing is copied.
 */
class ShareIntentModule : Module() {
  // The latest share that arrived while the app ran. One the app was opened with is the activity's own intent.
  private var pending: Intent? = null

  override fun definition() = ModuleDefinition {
    Name("ShareIntent")
    Events("onShare")

    Function("getShared") {
      val intent = pending ?: appContext.currentActivity?.intent
      if (intent == null || !isShare(intent)) null else describe(intent)
    }

    Function("clear") {
      pending = null
      // The activity keeps the intent it was opened (or last reopened) with; once handled it must not be read again.
      appContext.currentActivity?.let { activity -> if (isShare(activity.intent)) activity.intent = Intent(Intent.ACTION_MAIN) }
    }

    OnNewIntent { intent ->
      if (isShare(intent)) {
        pending = intent
        appContext.currentActivity?.intent = intent
        sendEvent("onShare", mapOf<String, Any>())
      }
    }
  }

  private fun isShare(intent: Intent) = intent.action == Intent.ACTION_SEND || intent.action == Intent.ACTION_SEND_MULTIPLE

  private fun streams(intent: Intent): List<Uri> {
    val out = mutableListOf<Uri>()
    if (intent.action == Intent.ACTION_SEND_MULTIPLE) {
      val list = if (Build.VERSION.SDK_INT >= 33) intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM, Uri::class.java)
      else @Suppress("DEPRECATION") intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)
      list?.let { out.addAll(it) }
    } else {
      val one = if (Build.VERSION.SDK_INT >= 33) intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
      else @Suppress("DEPRECATION") intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
      one?.let { out.add(it) }
    }
    // Some apps put the files only in the ClipData.
    if (out.isEmpty()) intent.clipData?.let { clip -> for (i in 0 until clip.itemCount) clip.getItemAt(i).uri?.let { out.add(it) } }
    return out
  }

  /** What the share holds: each file's address, name, size, type, and whether it can be read. */
  private fun describe(intent: Intent): Map<String, Any?> {
    val resolver = appContext.reactContext?.contentResolver
    val files = streams(intent).map { uri ->
      var name: String? = null
      var size: Long? = null
      var modified: Long? = null
      var readable = false
      var error: String? = null
      try {
        resolver?.query(uri, null, null, null, null)?.use { c ->
          if (c.moveToFirst()) {
            c.getColumnIndex(OpenableColumns.DISPLAY_NAME).takeIf { it >= 0 && !c.isNull(it) }?.let { name = c.getString(it) }
            c.getColumnIndex(OpenableColumns.SIZE).takeIf { it >= 0 && !c.isNull(it) }?.let { size = c.getLong(it) }
            c.getColumnIndex(DocumentsContract.Document.COLUMN_LAST_MODIFIED).takeIf { it >= 0 && !c.isNull(it) }?.let { modified = c.getLong(it) }
          }
        }
        // Opening it is the real test: some apps share addresses we aren't allowed to read.
        resolver?.openFileDescriptor(uri, "r")?.use { fd ->
          readable = true
          if (size == null && fd.statSize >= 0) size = fd.statSize
        }
      } catch (e: Exception) {
        error = e.message ?: e.javaClass.simpleName
      }
      if (uri.scheme == "file" && name == null) name = uri.lastPathSegment
      mapOf(
        "uri" to uri.toString(),
        "name" to name,
        "size" to size,
        "type" to ((try { resolver?.getType(uri) } catch (_: Exception) { null }) ?: intent.type),
        "lastModified" to modified,
        "readable" to readable,
        "error" to error,
      )
    }
    // A text share (a link, say) has no file: its text is passed along so the app can say what it got.
    val text = intent.getCharSequenceExtra(Intent.EXTRA_TEXT)?.toString()
    return mapOf("type" to intent.type, "files" to files, "text" to text)
  }
}
