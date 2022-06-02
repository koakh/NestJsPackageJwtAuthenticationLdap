import { SetMetadata } from '@nestjs/common';

export const Permissions = (...permissions: string[]) => {
  if (!permissions || permissions[0] === undefined) {
    return SetMetadata('permissions', permissions);
  }
  const setPermission: string[] = [];
  permissions.forEach((e: string) => {
    if (e.includes(',')) {
      const a = e.split(',');
      a.forEach(e => setPermission.push(e));
    } else {
      setPermission.push(e);
    }
  });
  return SetMetadata('permissions', setPermission);
};
