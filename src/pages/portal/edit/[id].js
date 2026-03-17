import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import {
  Button, Paper, TextInput, Select,
  Checkbox, Collapse, Divider, Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconArrowLeft, IconChevronDown,
  IconChevronRight, IconShield,
} from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { adminOnly } from "@/data/sidebar/employee";
import useEncrypt from "@/hooks/useEncrypt";

EditPortalUser.title = "Edit Portal User";

export default function EditPortalUser() {
  const router = useRouter();
  const { user } = useUser();
  const { API_URL } = useApi();
  const { showAlert } = useSwal();
  const { decrypt } = useEncrypt();
  const { id } = router.query;

  const [realId, setRealId]           = useState(null);
  const [roles, setRoles]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [apps, setApps]               = useState([]);
  const [permMap, setPermMap]         = useState({});
  const [loadingPerm, setLoadingPerm] = useState({});
  const [openApp, setOpenApp]         = useState({});
  const [checked, setChecked]         = useState({});
  const [copyUsers, setCopyUsers]     = useState([]);
  const [copyFrom, setCopyFrom]       = useState(null);
  const [initialLoaded, setInitialLoaded] = useState(false); // ← tambah
  const prevRoleRef = useRef(null);                          // ← tambah

  const form = useForm({
    initialValues: {
      full_name: "", badge_number: "", username: "",
      email: "", id_role: "", status_user: "1",
    },
    validate: {
      full_name:    (v) => v.trim() ? null : "Full Name is required",
      badge_number: (v) => v.trim() ? null : "Badge Number is required",
      username:     (v) => v.trim() ? null : "Username is required",
      email:        (v) => /^\S+@\S+$/.test(v) ? null : "Valid email is required",
      id_role:      (v) => v ? null : "Role is required",
      status_user:  (v) => v ? null : "Status is required",
    },
  });

  // decrypt id dari URL
  useEffect(() => {
    if (!id) return;
    try {
      const decrypted = decrypt(String(id));
      setRealId(decrypted);
    } catch (err) {
      console.error("Decrypt error:", err);
      showAlert("Error", "error", "Invalid user ID");
    }
  }, [id]);

  // fetch roles
  useEffect(() => {
    if (!user?.token) return;
    axios.post(`${API_URL}/api/master/role/serverside`, {}, {
      headers: { Authorization: `Bearer ${user.token}` },
    }).then(({ data }) => {
      setRoles(data.data.map((r) => ({ value: String(r.id_role), label: r.role_name })));
    }).catch(console.error);
  }, [user?.token, API_URL]);

  // fetch apps
  useEffect(() => {
    if (!user?.token) return;
    axios.get(`${API_URL}/api/permission/application?page=0&size=200`, {
      headers: { Authorization: `Bearer ${user.token}` },
    }).then(({ data }) => setApps(data.data || []))
    .catch(console.error);
  }, [user?.token, API_URL]);

  // fetch copy users dropdown
  useEffect(() => {
    if (!user?.token) return;
    axios.get(`${API_URL}/api/user/dropdown`, {
      headers: { Authorization: `Bearer ${user.token}` },
    }).then(({ data }) => {
      const list = (Array.isArray(data) ? data : []).map((u) => ({
        value: String(u.id_user),
        label: `${u.full_name} (${u.badge_number})`,
      }));
      setCopyUsers(list);
    }).catch(console.error);
  }, [user?.token, API_URL]);

  // fetch user data + existing permissions
  useEffect(() => {
    if (!realId || !user?.token) return;

    const fetchUser = async () => {
      try {
        const { data: u } = await axios.get(`${API_URL}/api/user/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        form.setValues({
          full_name:    u.full_name || "",
          badge_number: u.badge_number || "",
          username:     u.username || "",
          email:        u.email || "",
          id_role:      u.id_role?.toString() || "",
          status_user:  u.status_user?.toString() || "1",
        });

        const { data: existingPerms } = await axios.get(
          `${API_URL}/api/user/permissions/${realId}`,
          { headers: { Authorization: `Bearer ${user.token}` } },
        );

        const initChecked = {};
        (existingPerms || []).forEach((p) => {
          if (p.id_permission) initChecked[String(p.id_permission)] = true;
        });
        setChecked(initChecked);
        setInitialLoaded(true); // ← tandai initial load selesai

      } catch (err) {
        console.error(err);
        showAlert("Error", "error", "Failed to fetch user data");
      }
    };

    fetchUser();
  }, [realId, user?.token]);

  // auto-load permission dari role — hanya jalan kalau user GANTI role
  useEffect(() => {
    if (!form.values.id_role || !user?.token || apps.length === 0) return;
    if (!initialLoaded) return; // ← skip sebelum initial load selesai

    // skip pertama kali setelah initial load (role sudah di-set dari fetchUser)
    if (prevRoleRef.current === null) {
      prevRoleRef.current = form.values.id_role;
      return;
    }

    // skip kalau role tidak berubah
    if (prevRoleRef.current === form.values.id_role) return;
    prevRoleRef.current = form.values.id_role;

    const loadRolePermissions = async () => {
      try {
        const { data: rolePerms } = await axios.get(
          `${API_URL}/api/master/role/permissions/${form.values.id_role}`,
          { headers: { Authorization: `Bearer ${user.token}` } },
        );

        const updatedPermMap = { ...permMap };
        for (const app of apps) {
          if (!updatedPermMap[app.id_application]) {
            try {
              const { data } = await axios.get(
                `${API_URL}/api/permission/detail/${app.id_application}?page=0&size=500`,
                { headers: { Authorization: `Bearer ${user.token}` } },
              );
              updatedPermMap[app.id_application] = data.data || [];
            } catch {
              updatedPermMap[app.id_application] = [];
            }
          }
        }
        setPermMap(updatedPermMap);

        // ganti role → reset checked ke permission role baru
        const newChecked = {};
        (rolePerms || []).forEach((p) => {
          if (p.id_permission) newChecked[String(p.id_permission)] = true;
        });
        setChecked(newChecked);

      } catch (err) {
        console.error("Load role permissions error:", err);
      }
    };

    loadRolePermissions();
  }, [form.values.id_role, apps, initialLoaded]);

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

  const handleCopyFrom = (userId) => setCopyFrom(userId);

  const handleApplyCopy = async () => {
    if (!copyFrom) return;
    try {
      const { data } = await axios.get(
        `${API_URL}/api/user/permissions/${copyFrom}`,
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      const newChecked = {};
      (data || []).forEach((p) => {
        if (p.id_permission) newChecked[String(p.id_permission)] = true;
      });
      setChecked(newChecked);
    } catch (err) {
      console.error(err);
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
    if (loading) return;
    const confirm = await showAlert(
      "Are you sure?", "question",
      "Do you want to update this user?",
      true, null, "Update", "Cancel",
    );
    if (!confirm?.isConfirmed) return;

    const selectedPermissions = Object.entries(checked)
      .filter(([, v]) => v)
      .map(([permId]) => Number(permId));

    const payload = {
      full_name:    values.full_name,
      badge_number: values.badge_number,
      username:     values.username,
      email:        values.email,
      id_role:      Number(values.id_role),
      status_user:  Number(values.status_user),
    };

    try {
      setLoading(true);

      const res = await axios.put(
        `${API_URL}/api/user/update/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      await axios.post(
        `${API_URL}/api/user/permissions/${realId}`,
        {
          permissions: selectedPermissions,
          create_by: user?.id_user ?? user?.id ?? 0,
        },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      await showAlert("Success", "success", res.data?.message || "User updated successfully", false, 1500);
      router.push("/portal/user=");
    } catch (error) {
      showAlert("Error", "error", error.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout sidebarList={adminOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center gap-2">
              <IconArrowLeft
                size={18}
                onClick={() => router.push("/portal/user")}
                className="cursor-pointer hover:text-blue-600"
              />
              <h2 className="text-lg font-semibold uppercase tracking-wide">
                Edit Portal User
              </h2>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)} className="p-6">
              <div className="flex flex-col gap-6">
                <TextInput label="Full Name"    withAsterisk {...form.getInputProps("full_name")} />
                <TextInput label="Badge Number" withAsterisk {...form.getInputProps("badge_number")} />
                <TextInput label="Username"     withAsterisk {...form.getInputProps("username")} />
                <TextInput label="Email"        withAsterisk {...form.getInputProps("email")} />
                <Select
                  label="Role" placeholder="Select role"
                  data={roles} searchable withAsterisk
                  {...form.getInputProps("id_role")}
                />
                <Select
                  label="Account Status"
                  data={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]}
                  withAsterisk
                  {...form.getInputProps("status_user")}
                />

                <Divider my="xs" />

                <fieldset className="border border-gray-300 rounded-md px-4 pb-4 pt-2">
                  <legend className="px-2 text-sm font-semibold text-gray-700">
                    Application Permission
                  </legend>

                  <div className="flex items-center gap-4 mt-2 mb-4">
                    <span className="text-sm text-gray-600 whitespace-nowrap w-44">
                      Copy Permission From
                    </span>
                    <Select
                      placeholder="-- Select User Reference --"
                      data={copyUsers}
                      searchable
                      clearable
                      value={copyFrom}
                      onChange={handleCopyFrom}
                      className="flex-1"
                      size="sm"
                    />
                    <Button
                      size="xs"
                      variant="default"
                      disabled={!copyFrom}
                      onClick={handleApplyCopy}
                    >
                      Apply
                    </Button>
                  </div>

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
                <Button type="submit" size="xs" loading={loading}>
                  Update User
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}