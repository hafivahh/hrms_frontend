import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import {
  Button, Paper, TextInput,
  Checkbox, Collapse, Divider, Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconArrowLeft, IconChevronDown,
  IconChevronRight, IconShield,
} from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { master_data } from "@/data/sidebar/master_data";
import useEncrypt from "@/hooks/useEncrypt";

Edit_Role.title = "Edit Role";

export default function Edit_Role() {
  const router = useRouter();
  const { id_role } = router.query;
  const { decrypt } = useEncrypt();
  const { user } = useUser();
  const { API_URL } = useApi();
  const { showAlert } = useSwal();

  const [realId, setRealId]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [savingPerm, setSavingPerm]   = useState(false);
  const [apps, setApps]               = useState([]);
  const [permMap, setPermMap]         = useState({});
  const [loadingPerm, setLoadingPerm] = useState({});
  const [openApp, setOpenApp]         = useState({});
  const [checked, setChecked]         = useState({});

  const form = useForm({
    initialValues: { role_name: "" },
    validate: {
      role_name: (v) => v.trim().length > 0 ? null : "Role Name is required",
    },
  });

  // decrypt id_role
  useEffect(() => {
    if (!id_role) return;
    try {
      const decrypted = decrypt(String(id_role));
      setRealId(decrypted);
    } catch (err) {
      console.error("Decrypt error:", err);
    }
  }, [id_role]);

  // fetch role data — pakai id_role encrypted
  useEffect(() => {
    if (!id_role || !user?.token) return;
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/master/role/${id_role}`,
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        form.setValues({ role_name: data?.role_name || "" });
      } catch {
        showAlert("Error", "error", "Failed to load role data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id_role, user?.token]);

  // fetch apps
  useEffect(() => {
    if (!user?.token) return;
    axios.get(`${API_URL}/api/permission/application?page=0&size=200`, {
      headers: { Authorization: `Bearer ${user.token}` },
    }).then(({ data }) => setApps(data.data || []))
    .catch(console.error);
  }, [user?.token, API_URL]);

  // fetch existing role permissions — pakai realId
  useEffect(() => {
    if (!realId || !user?.token) return;
    axios.get(`${API_URL}/api/master/role/permissions/${realId}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    }).then(({ data }) => {
      const initChecked = {};
      (data || []).forEach((p) => {
        if (p.id_permission) initChecked[String(p.id_permission)] = true;
      });
      setChecked(initChecked);
    }).catch(console.error);
  }, [realId, user?.token]);

  // toggle expand app + lazy load permissions
  const handleToggleApp = async (appId) => {
    const willOpen = !openApp[appId];
    setOpenApp((prev) => ({ ...prev, [appId]: willOpen }));

    if (willOpen && !permMap[appId]) {
      setLoadingPerm((prev) => ({ ...prev, [appId]: true }));
      try {
        const { data } = await axios.get(
          `${API_URL}/api/permission/detail/${appId}?page=0&size=500`,
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        setPermMap((prev) => ({ ...prev, [appId]: data.data || [] }));
      } catch (err) {
        console.error(err);
        setPermMap((prev) => ({ ...prev, [appId]: [] }));
      } finally {
        setLoadingPerm((prev) => ({ ...prev, [appId]: false }));
      }
    }
  };

  const handleCheckOne = (permId, val) => {
    setChecked((prev) => ({ ...prev, [String(permId)]: val }));
  };

  const groupByGroup = (perms) =>
    perms.reduce((acc, p) => {
      const g = p.permission_group || "General";
      if (!acc[g]) acc[g] = [];
      acc[g].push(p);
      return acc;
    }, {});

  const handleSubmit = async (values) => {
    const confirm = await showAlert(
      "Are you sure?", "question",
      "Do you want to update this role?",
      true, null, "Update", "Cancel",
    );
    if (!confirm?.isConfirmed) return;
    if (!realId) {
      showAlert("Error", "error", "Role ID not ready");
      return;
    }

    const selectedPermissions = Object.entries(checked)
      .filter(([, v]) => v)
      .map(([id]) => Number(id));

    try {
      setSavingPerm(true);

      // Step 1: update role name — pakai id_role encrypted
      const { data } = await axios.put(
        `${API_URL}/api/master/role/${id_role}`,
        { role_name: values.role_name },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      // Step 2: save permissions — pakai realId plain integer
      await axios.post(
        `${API_URL}/api/master/role/permissions/${realId}`,
        {
          permissions: selectedPermissions,
          create_by: user?.id_user ?? user?.id ?? 0,
        },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      await showAlert("Success", "success", data.message || "Role updated successfully", false, 1500);
      router.replace;
    } catch (error) {
      const err = error.response?.data || {};
      showAlert(err.message || "Error", "error", err.error || "Failed to update role");
    } finally {
      setSavingPerm(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <AuthLayout sidebarList={[]} hideSidebar={true}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center gap-2">
              <IconArrowLeft
                size={18}
                onClick={() => router.push("/master/role/list")}
                className="cursor-pointer hover:text-blue-600"
              />
              <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-800">
                Edit Role
              </h2>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)} className="p-6">
              <div className="flex flex-col gap-6">
                <TextInput
                  label="Role Name"
                  withAsterisk
                  placeholder="Input Role Name"
                  {...form.getInputProps("role_name")}
                />

                <Divider my="xs" />

                {/* APPLICATION PERMISSION */}
                <fieldset className="border border-gray-300 rounded-md px-4 pb-4 pt-2">
                  <legend className="px-2 text-sm font-semibold text-gray-700">
                    Application Permission
                  </legend>

                  <div className="flex flex-col divide-y divide-gray-100">
                    {apps.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4 italic">
                        No applications found
                      </p>
                    )}

                    {apps.map((app) => {
                      const perms     = permMap[app.id_application] || [];
                      const isOpen    = !!openApp[app.id_application];
                      const isLoading = !!loadingPerm[app.id_application];
                      const groups    = groupByGroup(perms);

                      return (
                        <div key={app.id_application}>
                          <div
                            className="flex items-center gap-2 py-2 px-1 cursor-pointer hover:bg-gray-50 rounded select-none"
                            onClick={() => handleToggleApp(app.id_application)}
                          >
                            <IconShield size={15} className="text-gray-500 flex-shrink-0" />
                            <span className="text-sm text-gray-800 flex-1">
                              {app.app_name} - Permission Role
                            </span>
                            {isOpen
                              ? <IconChevronDown size={15} className="text-gray-400" />
                              : <IconChevronRight size={15} className="text-gray-400" />
                            }
                          </div>

                          <Collapse in={isOpen}>
                            <div className="ml-6 mb-3 mt-1 flex flex-col gap-3">
                              {isLoading && (
                                <div className="flex items-center gap-2 py-2">
                                  <Loader size="xs" />
                                  <span className="text-xs text-gray-400">Loading...</span>
                                </div>
                              )}

                              {!isLoading && perms.length === 0 && (
                                <p className="text-xs text-gray-400 italic">No permissions defined</p>
                              )}

                              {!isLoading && Object.entries(groups).map(([groupName, gPerms]) => (
                                <fieldset
                                  key={groupName}
                                  className="border border-gray-200 rounded px-3 pb-3 pt-1"
                                >
                                  <legend className="px-1">
                                    <span className="text-xs font-semibold text-gray-600 px-1">
                                      {groupName}
                                    </span>
                                  </legend>

                                  <div className="flex flex-col gap-1 mt-2">
                                    {gPerms.map((perm) => (
                                      <Checkbox
                                        key={perm.id_permission}
                                        label={
                                          <span className="text-sm text-gray-700">
                                            {perm.permission_name}
                                          </span>
                                        }
                                        size="sm"
                                        checked={!!checked[String(perm.id_permission)]}
                                        onChange={(e) =>
                                          handleCheckOne(perm.id_permission, e.currentTarget.checked)
                                        }
                                      />
                                    ))}
                                  </div>
                                </fieldset>
                              ))}
                            </div>
                          </Collapse>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              </div>

              <div className="flex justify-end mt-10">
                <Button size="xs" type="submit" loading={savingPerm}>
                  Update Role
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}