import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

let possiblePrefixes = [
  '/General/Staff/Weninger/Projects/InterpreterViz/VISSOFT25',
  '/General/Staff/Weninger/Teaching/CB/InterpreterViz/v1_0'
];

export let useNavigateWithPrefix = () => {
  let pathname = useLocation().pathname;
  let navigate = useNavigate();

  let prefix = useMemo(() => {
    let prefix = possiblePrefixes.find(p => pathname.startsWith(p));
    if (prefix) return prefix;

    return '';
  }, [pathname]);

  return useCallback(
    (path: string) => {
      if (path.startsWith('/')) path = path.slice(1);
      path = `${prefix}/${path}`;
      if (path.endsWith('/')) path = path.slice(0, -1);
      if (path == '') path = '/';

      return navigate(path);
    },
    [prefix]
  );
};
