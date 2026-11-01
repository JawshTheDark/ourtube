import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { VISIBILITY_HELP } from '../util.js';

let groupsCache = null;
/** The groups you're in (loaded once per visit; forgetGroups() after joining or making one). */
export function useMyGroups() {
  const [groups, setGroups] = useState(groupsCache);
  useEffect(() => {
    if (groupsCache) return;
    api('/groups')
      .then((r) => {
        groupsCache = r.groups;
        setGroups(r.groups);
      })
      .catch(() => setGroups([]));
  }, []);
  return groups;
}
export const forgetGroups = () => {
  groupsCache = null;
};

/** Public, unlisted, private, or only for one of your groups. Reports { visibility, group_id }. */
export function VisibilityField({ visibility, groupId, onChange, label = 'Visibility' }) {
  const groups = useMyGroups();
  const value = visibility === 'group' ? `group:${groupId || ''}` : visibility;
  const group = groups?.find((g) => g.id === groupId);
  const pick = (v) => onChange(v.startsWith('group:') ? { visibility: 'group', group_id: v.slice(6) } : { visibility: v, group_id: null });
  return (
    <div className="field">
      <label>{label}</label>
      <select className="select" value={value} onChange={(e) => pick(e.target.value)}>
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
        <option value="private">Private</option>
        {groups?.length > 0 && (
          <optgroup label="Only for a group">
            {groups.map((g) => (
              <option key={g.id} value={`group:${g.id}`}>
                {g.name}
              </option>
            ))}
          </optgroup>
        )}
        {visibility === 'group' && !group && <option value={value}>A group</option>}
      </select>
      <span className="hint">
        {visibility === 'group' ? `Only the people in ${group?.name || 'the group'} can watch it.` : VISIBILITY_HELP[visibility]}
        {groups && groups.length === 0 && (
          <>
            {' '}
            To share with just your family or friends, <Link to="/groups">make a group</Link>.
          </>
        )}
      </span>
    </div>
  );
}
