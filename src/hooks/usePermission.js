import useUser from "@/store/useUser";

export default function usePermission() {
  const { user } = useUser();
  const permissions = user?.permissions || [];

  const hasPermission = (indexKey) => permissions.includes(indexKey);
  const hasAnyPermission = (indexKeys) => indexKeys.some((k) => permissions.includes(k));

  return { hasPermission, hasAnyPermission, permissions };
}