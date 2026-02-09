import AuthLayout from "@/components/layout/authLayout";
import ManagerSelect from "@/components/ManagerSelect";
import { employee } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import axios from "axios";
import useUser from "@/store/useUser";
import useDecrypt from "@/hooks/useDecrypt";
import {
  Paper,
  TextInput,
  Textarea,
  Checkbox,
  Grid,
  Divider,
  Text,
  Box,
  Button,
  Group,
  Select,
  Table,
  Autocomplete,
  ActionIcon,
} from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy, IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import useSwal from "@/hooks/useSwal";

export default function IssMprEdit() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const { decrypt } = useDecrypt();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();
  const [departements, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [positions, setPositions] = useState([]);
  const [mprData, setMprData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState({});

  // Form state untuk edit
  // Form state untuk edit
  const [formData, setFormData] = useState({
    // =========================
    // MASTER DATA
    // =========================
    id_departement: "",
    id_project: "",
    id_position: "",
    work_type: "",
    qty: "",
    transfer_qty: "",
    vacant_type: "",
    is_budgeted: "",
    job_description: "",
    experience_years: "",
    contract_type: "",
    contract_duration: "",
    purpose: "",
    required_date: "",
    remarks: "",

    // =========================
    // EDUCATION & FACILITY
    // =========================
    education_level: [],
    education_note: {},
    access: [],
    printer: [],
    application: [],

    // =========================
    //  ASSIGNMENT
    // =========================
    requested_by: null,
    approved_section_manager: null,
    approved_cm: null,
    concurred_pmo: null,
    concurred_yard_manager: null,
    concurred_by: null, // khusus overhead
    acknowledged_by: null,
    approved_by: null,
  });

  // Style untuk input editable
  const editableInputStyle = {
    input: {
      backgroundColor: "#ffffff",
      cursor: "text",
    },
  };
  useEffect(() => {
    if (id) {
      fetchMprDetail();
    }
  }, [id]);
  // FETCH DATA DROPDOWN
  const fetchDropdown = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/iss_mpr/dropdowns`, {
        headers: { Authorization: "Bearer " + user.token },
      });

      setDepartments(
        data.departements.map((d) => ({
          value: d.id.toString(),
          label: d.departement_name,
        })),
      );

      setProjects(
        data.projects.map((p) => ({
          value: p.id.toString(),
          label: p.project_name,
        })),
      );
      setPositions(
        data.position_name.map((p) => ({
          value: p.id.toString(),
          label: p.position_name,
        })),
      );
    } catch (err) {
      console.error("Dropdown error:", err);
    }
  };

  useEffect(() => {
    fetchDropdown();
  }, []);

  const fetchMprDetail = async () => {
    try {
      const decryptedId = decrypt(id);

      const { data } = await axios.get(
        `${API_URL}/api/iss_mpr/${decryptedId}`,
        {
          headers: { Authorization: "Bearer " + user.token },
        },
      );

      const mpr = data.data;
      setMprData(mpr);

      // ✅ Extract education - konversi dari number ke string untuk Edit UI
      const educationDetails =
        mpr.details?.filter((d) => d.detail_type === 1) || [];
      const educationLevel = educationDetails.map((d) => {
        // Map number key ke string yang digunakan di UI
        const keyMap = {
          1: "degree",
          2: "diploma",
          3: "high_school",
          4: "others",
        };
        return keyMap[d.detail_key] || d.detail_key;
      });

      const educationNote = educationDetails.reduce((acc, d) => {
        const keyMap = {
          1: "degree",
          2: "diploma",
          3: "high_school",
          4: "others",
        };
        const stringKey = keyMap[d.detail_key] || d.detail_key;
        acc[stringKey] = d.detail_value;
        return acc;
      }, {});

      // ✅ LANGSUNG AMBIL STRING DARI DB
      const accessDetails =
        mpr.details
          ?.filter((d) => d.detail_type === 2)
          .map((d) => d.detail_value) || [];

      const printerDetails =
        mpr.details
          ?.filter((d) => d.detail_type === 3)
          .map((d) => d.detail_value) || [];

      const applicationDetails =
        mpr.details
          ?.filter((d) => d.detail_type === 4)
          .map((d) => d.detail_value) || [];

      setFormData({
        id_departement: mpr.id_departement?.toString() || "",
        id_project: mpr.id_project?.toString() || "",
        id_position: mpr.id_position?.toString() || "",
        work_type: mpr.work_type?.toString() || "",
        qty: mpr.qty?.toString() || "",
        transfer_qty: mpr.transfer_qty?.toString() || "",
        vacant_type: mpr.vacant_type === 1 ? "new_position" : "replacement",
        is_budgeted: mpr.is_budgeted === 1 ? "yes" : "no",
        job_description: mpr.job_description || "",
        experience_years: mpr.experience_years || "",
        contract_type: mpr.contract_type === 1 ? "permanent" : "contract",
        contract_duration: mpr.contract_duration || "",
        purpose: mpr.purpose || "",
        required_date: mpr.required_date
          ? new Date(mpr.required_date).toISOString().split("T")[0]
          : "",
        remarks: mpr.remarks || "",
        education_level: educationLevel,
        education_note: educationNote,
        access: accessDetails,
        printer: printerDetails,
        application: applicationDetails,
      });

      // Assignment mapping
      const mapAssignment = (index) => {
        const assign = mpr.assignments?.find((a) => a.index === index);
        if (!assign) return null;

        return {
          ...assign.user,
          approval_date: assign.assign_date,
          status_sign: assign.status_sign,
        };
      };

      setAssignments({
        requested_by: mapAssignment(1),
        approved_section_manager: mapAssignment(2),
        approved_cm: mapAssignment(3),
        concurred_pmo: mapAssignment(4),
        concurred_yard_manager: mapAssignment(5),
        concurred_by: mapAssignment(6),
        acknowledged_by: mapAssignment(7),
        approved_by: mapAssignment(8),
      });
      // ==========================
      // 🔥 TAMBAHAN: MAP ASSIGNMENT → formData (UNTUK EDIT)
      // ==========================
      setFormData((prev) => ({
        ...prev,
        requested_by:
          mpr.assignments?.find((a) => a.index === 1)?.user_id?.toString() ??
          null,
        approved_section_manager:
          mpr.assignments?.find((a) => a.index === 2)?.user_id?.toString() ??
          null,
        approved_cm:
          mpr.assignments?.find((a) => a.index === 3)?.user_id?.toString() ??
          null,
        concurred_pmo:
          mpr.assignments?.find((a) => a.index === 4)?.user_id?.toString() ??
          null,
        concurred_yard_manager:
          mpr.assignments?.find((a) => a.index === 5)?.user_id?.toString() ??
          null,
        concurred_by:
          mpr.assignments?.find((a) => a.index === 6)?.user_id?.toString() ??
          null,
        acknowledged_by:
          mpr.assignments?.find((a) => a.index === 7)?.user_id?.toString() ??
          null,
        approved_by:
          mpr.assignments?.find((a) => a.index === 8)?.user_id?.toString() ??
          null,
      }));

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch MPR detail:", err);
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEducationChange = (key, checked) => {
    setFormData((prev) => {
      const newEducationLevel = checked
        ? [...prev.education_level, key]
        : prev.education_level.filter((k) => k !== key);

      return {
        ...prev,
        education_level: newEducationLevel,
      };
    });
  };

  const handleEducationNoteChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      education_note: {
        ...prev.education_note,
        [key]: value,
      },
    }));
  };

  const handleCheckboxArrayChange = (field, key, checked) => {
    setFormData((prev) => {
      const newArray = checked
        ? [...prev[field], key]
        : prev[field].filter((k) => k !== key);

      return {
        ...prev,
        [field]: newArray,
      };
    });
  };
const toIntOrNull = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
};

const normalizeUserId = (val) => {
  if (!val) return null;
  if (typeof val === "object") return val.id_user ?? null;
  return Number(val);
};

const handleSave = async () => {
  try {
    const decryptedId = decrypt(id);

    const educationMap = {
      degree: 1,
      diploma: 2,
      high_school: 3,
      others: 4,
    };

    const payload = {
      // =========================
      // MASTER
      // =========================
      id_departement: toIntOrNull(formData.id_departement),
      id_project: toIntOrNull(formData.id_project),
      id_position: toIntOrNull(formData.id_position),
      work_type: toIntOrNull(formData.work_type),
      qty: toIntOrNull(formData.qty),
      transfer_qty: toIntOrNull(formData.transfer_qty),

      vacant_type: formData.vacant_type,
      budgeted: formData.is_budgeted,
      job_description: formData.job_description,
      experience_years: toIntOrNull(formData.experience_years),

      contract_type: formData.contract_type,
      contract_duration:
        formData.contract_type === "contract"
          ? toIntOrNull(formData.contract_duration)
          : null,

      purpose: formData.purpose,
      required_date: formData.required_date || null,
      remarks: formData.remarks,

      // =========================
      // EDUCATION
      // =========================
      education_level: formData.education_level.map(
        (lvl) => educationMap[lvl],
      ),
      education_note: Object.fromEntries(
        Object.entries(formData.education_note).map(([k, v]) => [
          educationMap[k],
          v,
        ]),
      ),

      // =========================
      // IT FACILITY
      // =========================
      access: formData.access || [],
      printer: formData.printer || [],
      application: formData.application || [],

      // =========================
      // ASSIGNMENT (SELALU DIKIRIM)
      // =========================
      requested_by: toIntOrNull(formData.requested_by),
      approved_section_manager: toIntOrNull(
        formData.approved_section_manager,
      ),
      approved_cm: toIntOrNull(formData.approved_cm),
      concurred_pmo: toIntOrNull(formData.concurred_pmo),
      concurred_yard_manager: toIntOrNull(
        formData.concurred_yard_manager,
      ),
      concurred_by: toIntOrNull(formData.concurred_by),
      acknowledged_by: toIntOrNull(formData.acknowledged_by),
      approved_by: toIntOrNull(formData.approved_by),
    };

    await axios.patch(
      `${API_URL}/api/iss_mpr/${decryptedId}`,
      payload,
      {
        headers: { Authorization: "Bearer " + user.token },
      },
    );

    await showAlert(
      "Success",
      "success",
      "MPR updated successfully",
      false,
      1500,
    );

    router.push("/iss_mpr/list/all");
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    showAlert(
      "Error",
      "error",
      err.response?.data?.message || "Failed to update MPR",
    );
  }
};


  const handleApproval = async (approvalType, status) => {
    try {
      const decryptedId = decrypt(id);

      await axios.patch(
        `${API_URL}/api/iss_mpr/${decryptedId}/approval`,
        {
          approval_type: approvalType,
          status,
        },
        {
          headers: { Authorization: "Bearer " + user.token },
        },
      );

      await showAlert(
        "Success",
        "success",
        "Item processed successfully",
        false,
        1000,
      );

      fetchMprDetail();
    } catch (err) {
      showAlert(
        "Error",
        "error",
        err.response?.data?.message || "Approval failed",
      );
    }
  };

  const handleAlert = (approvalType, status) => {
    showAlert(
      "Are you sure?",
      "question",
      `You are about to ${status} this MPR`,
      true,
      null,
      "Yes, proceed",
      "Cancel",
    ).then((confirmed) => {
      if (confirmed) {
        handleApproval(approvalType, status);
      }
    });
  };

  const AssignmentBox = ({
    title,
    employeeData,
    approvalType,
    currentUser,
  }) => {
    const isAssignedUser =
      currentUser?.badge_number &&
      employeeData?.badge_number &&
      currentUser.badge_number === employeeData.badge_number;

    const isNotApproved = !employeeData?.approval_date;

    const canApprove =
      approvalType && employeeData && isAssignedUser && isNotApproved;

    return (
      <Box
        style={{
          border: "1px solid #dee2e6",
          borderRadius: "6px",
          padding: "12px",
          marginBottom: "16px",
        }}
      >
        <Text size="sm" fw={600} mb={8}>
          {title}
        </Text>

        <Text size="sm" c="dimmed">
          Name: {employeeData?.full_name || "-"}
        </Text>
        <Text size="sm" c="dimmed">
          Date:{" "}
          {employeeData?.approval_date
            ? new Date(employeeData.approval_date).toLocaleDateString()
            : "-"}
        </Text>
        <Text size="sm" c="dimmed">
          Status:{" "}
          {employeeData?.status_sign === 1
            ? "Approved"
            : employeeData?.status_sign === 2
              ? "Rejected"
              : "Pending"}
        </Text>

        {canApprove && (
          <Group mt="md" grow>
            <Button
              size="xs"
              color="green"
              onClick={() => handleAlert(approvalType, "approved")}
            >
              Approve
            </Button>
            <Button
              size="xs"
              color="red"
              onClick={() => handleAlert(approvalType, "rejected")}
            >
              Reject
            </Button>
          </Group>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <AuthLayout sidebarList={employee}>
        <Paper radius="sm" mt="md" withBorder p="lg">
          <Text>Loading...</Text>
        </Paper>
      </AuthLayout>
    );
  }

  if (!mprData) {
    return (
      <AuthLayout sidebarList={employee}>
        <Paper radius="sm" mt="md" withBorder p="lg">
          <Text>MPR not found</Text>
        </Paper>
      </AuthLayout>
    );
  }

  //   const [localQuery, setLocalQuery] = useState("");
  //   const [allUsers, setAllUsers] = useState([]);
  //   const [filteredOptions, setFilteredOptions] = useState([]);
  //   const [isLoading, setIsLoading] = useState(false);
  //   const [selectedUser, setSelectedUser] = useState(null);

  //   // ✅ Fetch all users saat component mount
  //   useEffect(() => {
  //     const fetchUsers = async () => {
  //       try {
  //         setIsLoading(true);
  //         const res = await axios.get(`${API_URL}/api/user/list`, {
  //           headers: { Authorization: "Bearer " + user.token },
  //         });

  //         // Asumsi response format: array of users
  //         const users = res.data || [];
  //         setAllUsers(users);
  //       } catch (err) {
  //         console.error("Failed to fetch users:", err);
  //         showAlert("Error", "error", "Failed to load user list");
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     };

  //     fetchUsers();
  //   }, []);

  //   // ✅ Load selected user saat value berubah
  //   useEffect(() => {
  //     if (value && allUsers.length > 0) {
  //       const user = allUsers.find((u) => u.id_user === value);
  //       if (user) {
  //         setSelectedUser({
  //           id_user: user.id_user,
  //           badge_number: user.badge_number,
  //           full_name: user.full_name,
  //           label: `${user.badge_number} - ${user.full_name}`,
  //         });
  //       }
  //     } else if (!value) {
  //       setSelectedUser(null);
  //     }
  //   }, [value, allUsers]);

  //   // ✅ Filter users berdasarkan query (client-side)
  //   useEffect(() => {
  //     if (!localQuery || localQuery.trim().length === 0) {
  //       setFilteredOptions([]);
  //       return;
  //     }

  //     const query = localQuery.toLowerCase();
  //     const filtered = allUsers
  //       .filter(
  //         (u) =>
  //           u.badge_number?.toLowerCase().includes(query) ||
  //           u.full_name?.toLowerCase().includes(query)
  //       )
  //       .slice(0, 20) // Limit to 20 results
  //       .map((u) => ({
  //         id_user: u.id_user,
  //         badge_number: u.badge_number,
  //         full_name: u.full_name,
  //         label: `${u.badge_number} - ${u.full_name}`,
  //       }));

  //     setFilteredOptions(filtered);
  //   }, [localQuery, allUsers]);

  //   const displayValue = selectedUser?.label || "";

  //   return (
  //     <div style={{ position: "relative" }}>
  //       <Autocomplete
  //         placeholder="Type badge number or full name"
  //         value={localQuery || displayValue}
  //         data={filteredOptions.map((o) => o.label)}
  //         onChange={(val) => {
  //           setLocalQuery(val);

  //           const selected = filteredOptions.find((o) => o.label === val);

  //           if (selected) {
  //             // ✅ Simpan id_user (number) ke formData
  //             onChange(selected.id_user);
  //             setSelectedUser(selected);
  //             setLocalQuery("");
  //           }

  //           // Kalau user hapus manual isi input
  //           if (!val || val.trim() === "") {
  //             onChange(null);
  //             setSelectedUser(null);
  //             setLocalQuery("");
  //           }
  //         }}
  //         limit={20}
  //         nothingFoundMessage={
  //           isLoading
  //             ? "Loading users..."
  //             : localQuery.trim().length > 0
  //               ? "No user found"
  //               : "Start typing to search"
  //         }
  //         disabled={isLoading}
  //       />

  //       {/* Tombol hapus user */}
  //       {selectedUser && (
  //         <ActionIcon
  //           size="sm"
  //           color="red"
  //           variant="light"
  //           radius="xl"
  //           onClick={() => {
  //             setSelectedUser(null);
  //             setLocalQuery("");
  //             setFilteredOptions([]);
  //             onChange(null);
  //           }}
  //           style={{
  //             position: "absolute",
  //             right: 8,
  //             top: "50%",
  //             transform: "translateY(-50%)",
  //             zIndex: 2,
  //           }}
  //         >
  //           <IconX size={14} />
  //         </ActionIcon>
  //       )}
  //     </div>
  //   );
  // };
  return (
    <AuthLayout sidebarList={employee}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconArrowLeft
                  size={20}
                  onClick={() => router.back()}
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                />
                <h2 className="text-lg font-semibold">
                  Edit MPR - {mprData.mpr_no}
                </h2>
              </div>
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSave}
                color="blue"
              >
                Save Changes
              </Button>
            </div>

            {/* FORM CONTENT */}
            <div className="p-6">
              {/* Section 1: Department & Project */}
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Department"
                    value={formData.id_departement}
                    onChange={(value) =>
                      handleInputChange("id_departement", value)
                    }
                    data={departements}
                    searchable
                    styles={editableInputStyle}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Project"
                    value={formData.id_project}
                    onChange={(value) => handleInputChange("id_project", value)}
                    data={projects}
                    searchable
                    styles={editableInputStyle}
                  />
                </Grid.Col>
              </Grid>

              <Divider my="lg" />

              {/* Section 2: Position Vacant */}
              <h3 className="text-md font-semibold mb-4">Position Vacant</h3>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Position"
                    value={formData.id_position}
                    onChange={(value) =>
                      handleInputChange("id_position", value)
                    }
                    data={positions}
                    searchable
                    styles={editableInputStyle}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Employee Status"
                    value={formData.work_type?.toString()}
                    onChange={(value) =>
                      handleInputChange("work_type", parseInt(value))
                    }
                    data={[
                      { value: "1", label: "In Direct" },
                      { value: "2", label: "Direct" },
                    ]}
                    styles={editableInputStyle}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Qty"
                    type="number"
                    value={formData.qty}
                    onChange={(e) => handleInputChange("qty", e.target.value)}
                    styles={editableInputStyle}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Transfer Qty"
                    type="number"
                    value={formData.transfer_qty}
                    onChange={(e) =>
                      handleInputChange("transfer_qty", e.target.value)
                    }
                    styles={editableInputStyle}
                  />
                </Grid.Col>
              </Grid>

              {/* Vacant Type */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Vacant Type
                </label>
                <div className="space-y-2">
                  <Checkbox
                    label="New Position"
                    checked={formData.vacant_type === "new_position"}
                    onChange={(e) =>
                      handleInputChange(
                        "vacant_type",
                        e.currentTarget.checked ? "new_position" : "",
                      )
                    }
                  />
                  <Checkbox
                    label="Replacement"
                    checked={formData.vacant_type === "replacement"}
                    onChange={(e) =>
                      handleInputChange(
                        "vacant_type",
                        e.currentTarget.checked ? "replacement" : "",
                      )
                    }
                  />
                </div>
              </div>

              <Divider my="lg" />

              {/* Section 3: Budget */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  1. Is the above manpower request budgeted for in the Annual
                  Budget?
                </label>
                <div className="space-y-2 ml-4">
                  <Checkbox
                    label="Yes"
                    checked={formData.is_budgeted === "yes"}
                    onChange={(e) =>
                      handleInputChange(
                        "is_budgeted",
                        e.currentTarget.checked ? "yes" : "no",
                      )
                    }
                  />
                  <Checkbox
                    label="No"
                    checked={formData.is_budgeted === "no"}
                    onChange={(e) =>
                      handleInputChange(
                        "is_budgeted",
                        e.currentTarget.checked ? "no" : "yes",
                      )
                    }
                  />
                </div>
              </div>

              {/* Section 4: Job Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  2. Job Description
                </label>
                <Textarea
                  value={formData.job_description}
                  onChange={(e) =>
                    handleInputChange("job_description", e.target.value)
                  }
                  minRows={4}
                  styles={editableInputStyle}
                />
              </div>

              {/* Section 5: Experience */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  3. Years of Relevant Experience
                </label>
                <TextInput
                  value={formData.experience_years}
                  onChange={(e) =>
                    handleInputChange("experience_years", e.target.value)
                  }
                  styles={editableInputStyle}
                />
              </div>

              <Divider my="lg" />

              {/* Section 6: Education */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-4">
                  4. Educational Background
                </label>
                <div className="space-y-3 ml-4">
                  {[
                    { key: "degree", label: "Degree" },
                    { key: "diploma", label: "Diploma" },
                    { key: "high_school", label: "High School" },
                    { key: "others", label: "Others" },
                  ].map((item) => {
                    const isChecked = formData.education_level.includes(
                      item.key,
                    );
                    return (
                      <div
                        key={item.key}
                        className="grid grid-cols-[180px_1fr] items-center gap-4"
                      >
                        <Checkbox
                          label={item.label}
                          checked={isChecked}
                          onChange={(e) =>
                            handleEducationChange(
                              item.key,
                              e.currentTarget.checked,
                            )
                          }
                        />
                        <TextInput
                          value={formData.education_note[item.key] || ""}
                          onChange={(e) =>
                            handleEducationNoteChange(item.key, e.target.value)
                          }
                          disabled={!isChecked}
                          styles={isChecked ? editableInputStyle : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 7: Contract Type */}
              <label className="block text-sm font-medium mb-3">
                5. Contract Type
              </label>
              <div className="space-y-3 ml-4">
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <Checkbox
                    label="Probation / Permanent"
                    checked={formData.contract_type === "permanent"}
                    onChange={(e) =>
                      handleInputChange(
                        "contract_type",
                        e.currentTarget.checked ? "permanent" : "",
                      )
                    }
                  />
                  <div />
                </div>
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <Checkbox
                    label="Contract / Temporary"
                    checked={formData.contract_type === "contract"}
                    onChange={(e) =>
                      handleInputChange(
                        "contract_type",
                        e.currentTarget.checked ? "contract" : "",
                      )
                    }
                  />
                  <div className="flex items-center gap-2">
                    <TextInput
                      value={formData.contract_duration}
                      onChange={(e) =>
                        handleInputChange("contract_duration", e.target.value)
                      }
                      disabled={formData.contract_type !== "contract"}
                      className="w-40"
                      styles={
                        formData.contract_type === "contract"
                          ? editableInputStyle
                          : undefined
                      }
                    />
                    <span className="text-sm text-gray-600">Month</span>
                  </div>
                </div>
              </div>

              <Divider my="lg" />

              {/* Section 8: IT Facilities */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-4">
                  6. Information Technology Facilities
                </h3>
                <div className="space-y-2 ml-4">
                  <Checkbox
                    label="Computer"
                    checked={formData.access.includes("computer")}
                    onChange={(e) =>
                      handleCheckboxArrayChange(
                        "access",
                        "computer",
                        e.currentTarget.checked,
                      )
                    }
                  />
                  <Checkbox
                    label="Email"
                    checked={formData.access.includes("email")}
                    onChange={(e) =>
                      handleCheckboxArrayChange(
                        "access",
                        "email",
                        e.currentTarget.checked,
                      )
                    }
                  />
                </div>

                <label className="block text-sm font-medium mb-3 mt-4">
                  Printer
                </label>
                <div className="space-y-2 ml-4">
                  <Checkbox
                    label="Color"
                    checked={formData.printer.includes("color")}
                    onChange={(e) =>
                      handleCheckboxArrayChange(
                        "printer",
                        "color",
                        e.currentTarget.checked,
                      )
                    }
                  />
                  <Checkbox
                    label="Black / White"
                    checked={formData.printer.includes("black_white")}
                    onChange={(e) =>
                      handleCheckboxArrayChange(
                        "printer",
                        "black_white",
                        e.currentTarget.checked,
                      )
                    }
                  />
                </div>
              </div>

              {/* Application */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-3">
                  Application
                </label>
                <div className="space-y-2 ml-4">
                  <Checkbox
                    label="Employee Service System"
                    checked={formData.application.includes("self_service")}
                    onChange={(e) =>
                      handleCheckboxArrayChange(
                        "application",
                        "self_service",
                        e.currentTarget.checked,
                      )
                    }
                  />
                  <Checkbox
                    label="PCMS/ISS"
                    checked={formData.application.includes("pcms_iss")}
                    onChange={(e) =>
                      handleCheckboxArrayChange(
                        "application",
                        "pcms_iss",
                        e.currentTarget.checked,
                      )
                    }
                  />
                </div>
              </div>

              <Divider my="lg" />

              {/* Section 9: Purpose & Date */}
              <Grid>
                <Grid.Col span={12}>
                  <Textarea
                    label="Purpose for Request"
                    value={formData.purpose}
                    onChange={(e) =>
                      handleInputChange("purpose", e.target.value)
                    }
                    minRows={3}
                    styles={editableInputStyle}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Required Date"
                    type="date"
                    value={formData.required_date}
                    onChange={(e) =>
                      handleInputChange("required_date", e.target.value)
                    }
                    styles={editableInputStyle}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Remarks"
                    value={formData.remarks}
                    onChange={(e) =>
                      handleInputChange("remarks", e.target.value)
                    }
                    minRows={3}
                    styles={editableInputStyle}
                  />
                </Grid.Col>
              </Grid>

              <Divider my="lg" />

              <h3 className="text-md font-semibold mb-4">Assignment</h3>

<Table withTableBorder withColumnBorders>
  <Table.Thead>
    <Table.Tr>
      <Table.Th>Process</Table.Th>
      <Table.Th>User Assign</Table.Th>
    </Table.Tr>
  </Table.Thead>

  <Table.Tbody>
    <Table.Tr>
      <Table.Td>Requested By</Table.Td>
      <Table.Td>
        <ManagerSelect
          value={formData.requested_by}
          onChange={(val) =>
            handleInputChange("requested_by", normalizeUserId(val))
          }
        />
      </Table.Td>
    </Table.Tr>

    {formData.id_project !== "11" && (
      <>
        <Table.Tr>
          <Table.Td>Approved Section Manager</Table.Td>
          <Table.Td>
            <ManagerSelect
              value={formData.approved_section_manager}
              onChange={(val) =>
                handleInputChange(
                  "approved_section_manager",
                  normalizeUserId(val),
                )
              }
            />
          </Table.Td>
        </Table.Tr>

        <Table.Tr>
          <Table.Td>Approved CM</Table.Td>
          <Table.Td>
            <ManagerSelect
              value={formData.approved_cm}
              onChange={(val) =>
                handleInputChange("approved_cm", normalizeUserId(val))
              }
            />
          </Table.Td>
        </Table.Tr>

        <Table.Tr>
          <Table.Td>Concurred PMO</Table.Td>
          <Table.Td>
            <ManagerSelect
              value={formData.concurred_pmo}
              onChange={(val) =>
                handleInputChange("concurred_pmo", normalizeUserId(val))
              }
            />
          </Table.Td>
        </Table.Tr>

        <Table.Tr>
          <Table.Td>Concurred Yard Manager</Table.Td>
          <Table.Td>
            <ManagerSelect
              value={formData.concurred_yard_manager}
              onChange={(val) =>
                handleInputChange(
                  "concurred_yard_manager",
                  normalizeUserId(val),
                )
              }
            />
          </Table.Td>
        </Table.Tr>
      </>
    )}

    {formData.id_project === "11" && (
      <Table.Tr>
        <Table.Td>Concurred By</Table.Td>
        <Table.Td>
          <ManagerSelect
            value={formData.concurred_by}
            onChange={(val) =>
              handleInputChange("concurred_by", normalizeUserId(val))
            }
          />
        </Table.Td>
      </Table.Tr>
    )}

    <Table.Tr>
      <Table.Td>Acknowledged By HR</Table.Td>
      <Table.Td>
        <ManagerSelect
          value={formData.acknowledged_by}
          onChange={(val) =>
            handleInputChange("acknowledged_by", normalizeUserId(val))
          }
        />
      </Table.Td>
    </Table.Tr>

    <Table.Tr>
      <Table.Td>Approved By President Director</Table.Td>
      <Table.Td>
        <ManagerSelect
          value={formData.approved_by}
          onChange={(val) =>
            handleInputChange("approved_by", normalizeUserId(val))
          }
        />
      </Table.Td>
    </Table.Tr>
  </Table.Tbody>
</Table>

            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
