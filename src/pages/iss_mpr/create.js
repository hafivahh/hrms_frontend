import AuthLayout from "@/components/layout/authLayout";
import { employee } from "@/data/sidebar/employee";
import ManagerSelect from "@/components/ManagerSelect";
import useApi from "@/hooks/useApi";
import axios from "axios";
import useUser from "@/store/useUser";
import useSwal from "@/hooks/useSwal";
import {
  Paper,
  Select,
  TextInput,
  Textarea,
  Button,
  Checkbox,
  Group,
  Grid,
  Divider,
  Table,
  Autocomplete,
  ActionIcon,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconArrowLeft, IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

const employee_status = [
  { value: "1", label: "In Direct" },
  { value: "2", label: "Direct" },
];

export default function IssMprCreate() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const [departements, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [positions, setPositions] = useState([]);

  const [formData, setFormData] = useState({
    // Section 1
    id_departement: "",
    id_project: "",
    id_position: "",
    // Section 2
    work_type: "",
    qty: "",
    transfer_qty: "",
    vacant_type: "",
    // Section 3
    budgeted: "",
    // Section 4
    job_description: "",
    experience_years: "",
    education_level: [],
    education_note: {},
    // Section 5–7
    contract_type: "",
    contract_duration: "",
    access: [],
    share_folder: [],
    printer: [],
    application: [],
    // Section 8
    purpose: "",
    required_date: null,
    remarks: "",
    // Section 9 - Ubah menjadi null (id_user number)
    requested_by: null,
    approved_section_manager: null,
    approved_cm: null,
    concurred_pmo: null,
    concurred_yard_manager: null,
    concurred_by: null,
    acknowledged_by: null,
    approved_by: null,
  });

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field, value, checked) => {
    setFormData((prev) => {
      const currentValues = prev[field] || [];
      if (checked) {
        return { ...prev, [field]: [...currentValues, value] };
      } else {
        return {
          ...prev,
          [field]: currentValues.filter((v) => v !== value),
        };
      }
    });
  };

  const handleEducationChange = (key, checked) => {
    setFormData((prev) => {
      const currentLevels = prev.education_level || [];
      if (checked) {
        return {
          ...prev,
          education_level: [...currentLevels, key],
        };
      } else {
        return {
          ...prev,
          education_level: currentLevels.filter((v) => v !== key),
        };
      }
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

  // ✅ Helper untuk normalize user ID dari ManagerSelect
  const normalizeUserId = (val) => {
    if (!val) return null;
    if (typeof val === "object") return val.id_user ?? null;
    return Number(val);
  };

  const validateForm = () => {
    if (!formData.id_departement) {
      showAlert("Information", "info", "Please select Department", "Oke");
      return false;
    }

    if (!formData.id_project) {
      showAlert("Information", "info", "Please select Project", "Oke");
      return false;
    }

    if (!formData.id_position) {
      showAlert("Information", "info", "Please select Position", "Oke");
      return false;
    }

    if (!formData.work_type) {
      showAlert("Information", "info", "Please select Employee Status", "Oke");
      return false;
    }

    if (!formData.qty) {
      showAlert("Information", "info", "Please input Qty", "Oke");
      return false;
    }

    if (!formData.vacant_type) {
      showAlert("Information", "info", "Please choose Vacant Type", "Oke");
      return false;
    }

    // Section 3: Budgeted
    if (!formData.budgeted) {
      showAlert(
        "Information",
        "info",
        "Please choose Annual Budget option",
        "Oke",
      );
      return false;
    }

    // Section 5: Years of Experience
    if (!formData.experience_years) {
      showAlert(
        "Information",
        "info",
        "Please input Years of Relevant Experience",
        "Oke",
      );
      return false;
    }

    // Section 6: Educational Background
    if (formData.education_level.length === 0) {
      showAlert(
        "Information",
        "info",
        "Please select at least one Educational Background",
        "Oke",
      );
      return false;
    }

    // Section 7: Contract Type
    if (!formData.contract_type) {
      showAlert("Information", "info", "Please choose Contract Type", "Oke");
      return false;
    }
    if (formData.contract_type === "contract" && !formData.contract_duration) {
      showAlert("Information", "info", "Please input Contract Duration", "Oke");
      return false;
    }

    // Section 8–9: IT Facilities & Applications
    if (formData.access.length === 0) {
      showAlert(
        "Information",
        "info",
        "Please select at least one IT Access",
        "Oke",
      );
      return false;
    }
    if (formData.share_folder.length === 0) {
      showAlert(
        "Information",
        "info",
        "Please select at least one Share Folder option",
        "Oke",
      );
      return false;
    }

    // Section 10: Purpose & Date & Remarks
    if (!formData.purpose) {
      showAlert(
        "Information",
        "info",
        "Please input Purpose for Request",
        "Oke",
      );
      return false;
    }
    if (!formData.required_date) {
      showAlert("Information", "info", "Please select Required Date", "Oke");
      return false;
    }
    if (!formData.remarks) {
      showAlert("Information", "info", "Please input Remarks", "Oke");
      return false;
    }

    // Section 11: Assignment
    const requiredAssignments = [
      "requested_by",
      "acknowledged_by",
      "approved_by",
    ];
    if (formData.id_project !== "11") {
      requiredAssignments.push(
        "approved_section_manager",
        "approved_cm",
        "concurred_pmo",
        "concurred_yard_manager",
      );
    } else {
      requiredAssignments.push("concurred_by");
    }

    for (const field of requiredAssignments) {
      if (!formData[field]) {
        showAlert(
          "Information",
          "info",
          `Please assign ${field.replaceAll("_", " ")}`,
          "Oke",
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const confirm = await showAlert(
      "Are you sure?",
      "question",
      "Do you want to submit this Manpower Request?",
      true,
      null,
      "Submit",
      "Cancel",
    );

    if (!confirm?.isConfirmed) return;

    const payload = {
      ...formData,

      // normalisasi ID (Select → string → number)
      id_departement: Number(formData.id_departement),
      id_project: Number(formData.id_project),
      id_position: Number(formData.id_position),

      // ✅ Assignment fields - langsung kirim id_user (number atau null)
      requested_by: formData.requested_by,
      approved_section_manager: formData.approved_section_manager,
      approved_cm: formData.approved_cm,
      concurred_pmo: formData.concurred_pmo,
      concurred_yard_manager: formData.concurred_yard_manager,
      concurred_by: formData.concurred_by,
      acknowledged_by: formData.acknowledged_by,
      approved_by: formData.approved_by,

      // numeric field
      qty:
        formData.qty === "" || formData.qty === undefined
          ? null
          : Number(formData.qty),

      transfer_qty:
        formData.transfer_qty === "" || formData.transfer_qty === undefined
          ? null
          : Number(formData.transfer_qty),

      experience_years: formData.experience_years
        ? Number(formData.experience_years)
        : null,
      contract_duration:
        formData.contract_type === "contract"
          ? Number(formData.contract_duration)
          : null,

      // date
      required_date: formData.required_date
        ? formData.required_date.toISOString()
        : null,
    };

    try {
      console.log("SUBMIT payload (MPR):", payload);

      const res = await axios.post(`${API_URL}/api/iss_mpr/create`, payload, {
        headers: {
          Authorization: "Bearer " + user.token,
        },
      });

      console.log("RESPONSE (create MPR):", res);

      const data = res.data;
      const isSuccess = !!(
        data &&
        (data.success === true || data.id || data.createdAt || data.data)
      );

      if (isSuccess) {
        const message = data?.message || "MPR created successfully";
        await showAlert("Success", "success", message, false, 1500);
        router.back();
        return;
      }

      console.warn("Unexpected response shape:", data);
      const errMsg = data?.message || "Unexpected response from server";
      showAlert("Error", "error", errMsg);
    } catch (error) {
      console.error("CREATE MPR error:", error);
      const data_error = error.response?.data || null;

      if (data_error) {
        const msg = data_error.message || "Failed to create MPR";
        const detail = data_error.error || "";
        showAlert(msg, "error", detail);
      } else if (error.request) {
        showAlert(
          "Network Error",
          "error",
          "No response from server (check backend/CORS).",
        );
      } else {
        showAlert("Error", "error", error.message || "Unknown error");
      }
    }
  };

  /**
   * ✅ KOMPONEN: PortalUserSelect
   * Menggunakan endpoint /api/user/list yang sudah ada
   * dengan client-side filtering
   */
  const PortalUserSelect = ({ value, onChange }) => {
    const [localQuery, setLocalQuery] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // ✅ Fetch all users saat component mount
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          setIsLoading(true);
          const res = await axios.get(`${API_URL}/api/user/list`, {
            headers: { Authorization: "Bearer " + user.token },
          });

          // Asumsi response format: array of users
          const users = res.data || [];
          setAllUsers(users);
        } catch (err) {
          console.error("Failed to fetch users:", err);
          showAlert("Error", "error", "Failed to load user list");
        } finally {
          setIsLoading(false);
        }
      };

      fetchUsers();
    }, []);

    // ✅ Load selected user saat value berubah
    useEffect(() => {
      if (value && allUsers.length > 0) {
        const user = allUsers.find((u) => u.id_user === value);
        if (user) {
          setSelectedUser({
            id_user: user.id_user,
            badge_number: user.badge_number,
            full_name: user.full_name,
            label: `${user.badge_number} - ${user.full_name}`,
          });
        }
      } else if (!value) {
        setSelectedUser(null);
      }
    }, [value, allUsers]);

    // ✅ Filter users berdasarkan query (client-side)
    useEffect(() => {
      if (!localQuery || localQuery.trim().length === 0) {
        setFilteredOptions([]);
        return;
      }

      const query = localQuery.toLowerCase();
      const filtered = allUsers
        .filter(
          (u) =>
            u.badge_number?.toLowerCase().includes(query) ||
            u.full_name?.toLowerCase().includes(query),
        )
        .slice(0, 20) // Limit to 20 results
        .map((u) => ({
          id_user: u.id_user,
          badge_number: u.badge_number,
          full_name: u.full_name,
          label: `${u.badge_number} - ${u.full_name}`,
        }));

      setFilteredOptions(filtered);
    }, [localQuery, allUsers]);

    const displayValue = selectedUser?.label || "";

    return (
      <div style={{ position: "relative" }}>
        <Autocomplete
          placeholder="Type badge number or full name"
          value={localQuery || displayValue}
          data={filteredOptions.map((o) => o.label)}
          onChange={(val) => {
            setLocalQuery(val);

            const selected = filteredOptions.find((o) => o.label === val);

            if (selected) {
              // ✅ Simpan id_user (number) ke formData
              onChange(selected.id_user);
              setSelectedUser(selected);
              setLocalQuery("");
            }

            // Kalau user hapus manual isi input
            if (!val || val.trim() === "") {
              onChange(null);
              setSelectedUser(null);
              setLocalQuery("");
            }
          }}
          limit={20}
          nothingFoundMessage={
            isLoading
              ? "Loading users..."
              : localQuery.trim().length > 0
                ? "No user found"
                : "Start typing to search"
          }
          disabled={isLoading}
        />

        {/* Tombol hapus user */}
        {selectedUser && (
          <ActionIcon
            size="sm"
            color="red"
            variant="light"
            radius="xl"
            onClick={() => {
              setSelectedUser(null);
              setLocalQuery("");
              setFilteredOptions([]);
              onChange(null);
            }}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
            }}
          >
            <IconX size={14} />
          </ActionIcon>
        )}
      </div>
    );
  };

  return (
    <AuthLayout sidebarList={employee}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconArrowLeft
                size={20}
                onClick={() => router.back()}
                className="cursor-pointer hover:text-blue-600 transition-colors"
              />
              <h2 className="text-lg font-semibold">Create Manpower Request</h2>
            </div>

            {/* FORM CONTENT */}
            <div className="p-6">
              {/* Section 1: Department & Project */}
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Department"
                    data={departements}
                    value={formData.id_departement}
                    onChange={(val) => handleInputChange("id_departement", val)}
                    searchable
                    withAsterisk
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Project"
                    data={projects}
                    value={formData.id_project}
                    onChange={(val) => handleInputChange("id_project", val)}
                    searchable
                    withAsterisk
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
                    data={positions}
                    value={formData.id_position}
                    onChange={(val) => handleInputChange("id_position", val)}
                    searchable
                    withAsterisk
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Employee Status"
                    placeholder="Select Employee Status"
                    data={employee_status}
                    value={formData.work_type}
                    onChange={(val) => handleInputChange("work_type", val)}
                    withAsterisk
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    type="number"
                    label="Qty"
                    placeholder="Total Person"
                    description={
                      <span className="text-cyan-500 italic text-xs">
                        *QTY = (New Join QTY + Transferred QTY)
                      </span>
                    }
                    value={formData.qty}
                    onChange={(e) => handleInputChange("qty", e.target.value)}
                    withAsterisk
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Transfer Qty"
                    placeholder="Total Transfer Employee"
                    description={
                      <span className="text-red-500 italic text-xs">
                        *Fill this column if there any transfer employee on this
                        MPR!
                      </span>
                    }
                    value={formData.transfer_qty}
                    onChange={(e) =>
                      handleInputChange("transfer_qty", e.target.value)
                    }
                  />
                </Grid.Col>
              </Grid>

              {/* Vacant Type Radio */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Please choose one <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <Checkbox
                    label="New Position"
                    checked={formData.vacant_type === "new_position"}
                    onChange={(e) =>
                      handleInputChange(
                        "vacant_type",
                        e.target.checked ? "new_position" : "",
                      )
                    }
                  />
                  <Checkbox
                    label="Replacement"
                    checked={formData.vacant_type === "replacement"}
                    onChange={(e) =>
                      handleInputChange(
                        "vacant_type",
                        e.target.checked ? "replacement" : "",
                      )
                    }
                  />
                </div>
              </div>

              <Divider my="lg" />

              {/* Section 3: Annual Budget */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  1. Is the above manpower request budgeted for in the Annual
                  Budget ?<span className="text-red-500">*</span>
                </label>

                <div className="space-y-2 ml-4">
                  <Checkbox
                    label="Yes"
                    checked={formData.budgeted === "yes"}
                    onChange={() => handleInputChange("budgeted", "yes")}
                  />
                  <Checkbox
                    label="No"
                    checked={formData.budgeted === "no"}
                    onChange={() => handleInputChange("budgeted", "no")}
                  />
                </div>
              </div>

              {/* Section 4: Job Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  2. Job Description <span className="text-red-500">*</span>
                </label>

                <ReactQuill
                  theme="snow"
                  value={formData.job_description}
                  onChange={(value) =>
                    handleInputChange("job_description", value)
                  }
                  modules={{
                    toolbar: [
                      ["bold", "italic", "underline"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["clean"],
                    ],
                  }}
                />
              </div>

              {/* Section 5: Years of Relevant Experience */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  3. Years of Relevant Experience{" "}
                  <span className="text-red-500">*</span>
                </label>

                <TextInput
                  placeholder="Input Years of Relevant Experience"
                  value={formData.experience_years}
                  onChange={(e) =>
                    handleInputChange("experience_years", e.target.value)
                  }
                />
              </div>

              <Divider my="lg" />

              {/* Section 6: Educational Background */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-4">
                  4. Educational Background{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="space-y-3 ml-4">
                  {[
                    { key: "degree", label: "Degree" },
                    { key: "diploma", label: "Diploma" },
                    { key: "high_school", label: "High School" },
                    { key: "others", label: "Others" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="grid grid-cols-[180px_1fr] items-center gap-4"
                    >
                      <Checkbox
                        label={item.label}
                        checked={formData.education_level.includes(item.key)}
                        onChange={(e) =>
                          handleEducationChange(item.key, e.target.checked)
                        }
                      />
                      <TextInput
                        placeholder="Additional info"
                        value={formData.education_note[item.key] || ""}
                        onChange={(e) =>
                          handleEducationNoteChange(item.key, e.target.value)
                        }
                        disabled={!formData.education_level.includes(item.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 7: Contract Type */}
              <label className="block text-sm font-medium mb-3">
                5. Contract Type <span className="text-red-500">*</span>
              </label>

              <div className="space-y-3 ml-4">
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <Checkbox
                    label="Probation / Permanent"
                    checked={formData.contract_type === "permanent"}
                    onChange={() =>
                      handleInputChange("contract_type", "permanent")
                    }
                  />
                  <div />
                </div>

                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <Checkbox
                    label="Contract / Temporary"
                    checked={formData.contract_type === "contract"}
                    onChange={() =>
                      handleInputChange("contract_type", "contract")
                    }
                  />

                  <div className="flex items-center gap-2">
                    <TextInput
                      type="number"
                      placeholder="Contract Duration"
                      value={formData.contract_duration}
                      onChange={(e) =>
                        handleInputChange("contract_duration", e.target.value)
                      }
                      disabled={formData.contract_type !== "contract"}
                      className="w-40"
                    />
                    <span className="text-sm text-gray-600">Month</span>
                  </div>
                </div>
              </div>

              <Divider my="lg" />

              {/* Section 8: Information Technology Facilities */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-4">
                  6. Information Technology Facilities{" "}
                  <span className="text-red-500">*</span>
                </h3>

                <div className="mb-6">
                  <div className="space-y-2 ml-4">
                    <Checkbox
                      label="Computer"
                      checked={formData.access.includes("computer")}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "access",
                          "computer",
                          e.target.checked,
                        )
                      }
                    />
                    <Checkbox
                      label="Email"
                      checked={formData.access.includes("email")}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "access",
                          "email",
                          e.target.checked,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">
                    Share Folder
                  </label>
                  <div className="space-y-2 ml-4">
                    <Checkbox
                      label="Public"
                      checked={formData.share_folder.includes("public")}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "share_folder",
                          "public",
                          e.target.checked,
                        )
                      }
                    />
                    <Checkbox
                      label="Department"
                      checked={formData.share_folder.includes("department")}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "share_folder",
                          "department",
                          e.target.checked,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">
                    Printer
                  </label>
                  <div className="space-y-2 ml-4">
                    <Checkbox
                      label="Color"
                      checked={formData.printer.includes("color")}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "printer",
                          "color",
                          e.target.checked,
                        )
                      }
                    />
                    <Checkbox
                      label="Black / White"
                      checked={formData.printer.includes("black_white")}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "printer",
                          "black_white",
                          e.target.checked,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Section 9: Application */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-3">
                  Application
                </label>
                <div className="space-y-2 ml-4">
                  <Checkbox
                    label="Employee Service System"
                    checked={formData.application.includes("self_service")}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "application",
                        "self_service",
                        e.target.checked,
                      )
                    }
                  />
                  <Checkbox
                    label="PCMS/ISS"
                    checked={formData.application.includes("pcms_iss")}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "application",
                        "pcms_iss",
                        e.target.checked,
                      )
                    }
                  />
                  <div>
                    <span className="text-red-500 italic text-xs ml-6">
                      *For Authorized Personnel Only
                    </span>
                  </div>
                </div>
              </div>

              <Divider my="lg" />

              {/* Section 10: Purpose & Required Date */}
              <Grid>
                <Grid.Col span={12}>
                  <Textarea
                    label="Purpose for Request"
                    placeholder="Input Purpose of Request"
                    minRows={3}
                    value={formData.purpose}
                    onChange={(e) =>
                      handleInputChange("purpose", e.target.value)
                    }
                    withAsterisk
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <DateInput
                    label="Required Date"
                    placeholder="dd/mm/yyyy"
                    valueFormat="DD/MM/YYYY"
                    value={formData.required_date}
                    onChange={(val) => handleInputChange("required_date", val)}
                    withAsterisk
                  />
                  <span className="text-red-500 italic text-xs">
                    *Minimum 30 days After Create
                  </span>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Remarks"
                    placeholder="Ex : Transfer from Sofia"
                    minRows={3}
                    value={formData.remarks}
                    onChange={(e) =>
                      handleInputChange("remarks", e.target.value)
                    }
                    withAsterisk
                  />
                </Grid.Col>
              </Grid>

              <Divider my="lg" />

              {/* Section 11: Assignment */}
              <h3 className="text-md font-semibold mb-4">Assignment</h3>

              <Table withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th className="bg-gray-100">Process</Table.Th>
                    <Table.Th className="bg-gray-100">
                      User Assign <span className="text-red-500">*</span>
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {/* Requested By - SELALU TAMPIL */}
                  <Table.Tr>
                    <Table.Td>Requested By (End User)</Table.Td>
                    <Table.Td>
                      <ManagerSelect
                        value={formData.requested_by}
                        onChange={(val) =>
                          handleInputChange(
                            "requested_by",
                            normalizeUserId(val),
                          )
                        }
                      />
                    </Table.Td>
                  </Table.Tr>

                  {/* Approved By Section Manager - HANYA UNTUK NON-OVERHEAD */}
                  {formData.id_project !== "11" && (
                    <Table.Tr>
                      <Table.Td>Approved By Section Manager</Table.Td>
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
                  )}

                  {/* Approved By (CM) - HANYA UNTUK NON-OVERHEAD */}
                  {formData.id_project !== "11" && (
                    <Table.Tr>
                      <Table.Td>Approved By (CM)</Table.Td>
                      <Table.Td>
                        <ManagerSelect
                          value={formData.approved_cm}
                          onChange={(val) =>
                            handleInputChange(
                              "approved_cm",
                              normalizeUserId(val),
                            )
                          }
                        />
                      </Table.Td>
                    </Table.Tr>
                  )}

                  {/* Concurred By (PMO) - HANYA UNTUK NON-OVERHEAD */}
                  {formData.id_project !== "11" && (
                    <Table.Tr>
                      <Table.Td>Concurred By (PMO)</Table.Td>
                      <Table.Td>
                        <ManagerSelect
                          value={formData.concurred_pmo}
                          onChange={(val) =>
                            handleInputChange(
                              "concurred_pmo",
                              normalizeUserId(val),
                            )
                          }
                        />
                      </Table.Td>
                    </Table.Tr>
                  )}

                  {/* Concurred Yard Manager - HANYA UNTUK NON-OVERHEAD */}
                  {formData.id_project !== "11" && (
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
                  )}

                  {/* Concurred By - HANYA UNTUK OVERHEAD */}
                  {formData.id_project === "11" && (
                    <Table.Tr>
                      <Table.Td>Concurred By</Table.Td>
                      <Table.Td>
                        <ManagerSelect
                          value={formData.concurred_by}
                          onChange={(val) =>
                            handleInputChange(
                              "concurred_by",
                              normalizeUserId(val),
                            )
                          }
                        />
                      </Table.Td>
                    </Table.Tr>
                  )}

                  {/* Acknowledged By HR - SELALU TAMPIL */}
                  <Table.Tr>
                    <Table.Td>Acknowledged By HR</Table.Td>
                    <Table.Td>
                      <ManagerSelect
                        value={formData.acknowledged_by}
                        onChange={(val) =>
                          handleInputChange(
                            "acknowledged_by",
                            normalizeUserId(val),
                          )
                        }
                      />
                    </Table.Td>
                  </Table.Tr>

                  {/* Approved By (President Director) - SELALU TAMPIL */}
                  <Table.Tr>
                    <Table.Td>Approved By (President Director)</Table.Td>
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

              <Divider my="lg" />

              {/* Submit Button */}
              <Group justify="flex-end" mt="xl">
                <Button size="sx" onClick={handleSubmit}>
                  Submit
                </Button>
              </Group>
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
