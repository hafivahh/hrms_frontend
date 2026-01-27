import AuthLayout from "@/components/layout/authLayout";
import { employee } from "@/data/sidebar/employee";
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
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconUsers, IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const employee_status = [
  { value: "0", label: "In Direct" },
  { value: "1", label: "Direct" },
  { value: "2", label: "Team Support" },
];

export default function IssMprCreate() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const [departements, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [job_title, setJobtitles] = useState([]);

  const [formData, setFormData] = useState({
    // Section 1
    id_departement: "",
    id_project: "",
    id_job_title: "",
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

    // 🔥 FIX PENTING
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

    // Section 9 - Ubah dari ID ke badge_number
    requested_by: "",
    approved_section_manager: "",
    approved_cm: "",
    concurred_pmo: "",
    concurred_yard_manager: "",
    concurred_by: "",
    acknowledged_by: "",
    approved_by: "",
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
        }))
      );

      setProjects(
        data.projects.map((p) => ({
          value: p.id.toString(),
          label: p.project_name,
        }))
      );

      setJobtitles(
        data.job_titles.map((j) => ({
          value: j.id.toString(),
          label: j.job_title,
        }))
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

  const handleSubmit = async () => {
    const confirm = await showAlert(
      "Are you sure?",
      "question",
      "Do you want to submit this Manpower Request?",
      true,
      null,
      "Submit",
      "Cancel"
    );

    if (!confirm) return;

    const payload = {
      ...formData,

      // 🔹 normalisasi ID (Select → string → number)
      id_departement: Number(formData.id_departement),
      id_project: Number(formData.id_project),
      id_job_title: Number(formData.id_job_title),

      // 🔹 Assignment fields - sekarang menggunakan badge_number (string atau number tergantung backend)
      requested_by: formData.requested_by || null,
      approved_section_manager: formData.approved_section_manager || null,
      approved_cm: formData.approved_cm || null,
      concurred_pmo: formData.concurred_pmo || null,
      concurred_yard_manager: formData.concurred_yard_manager || null,
      concurred_by: formData.concurred_by || null,
      acknowledged_by: formData.acknowledged_by || null,
      approved_by: formData.approved_by || null,

      // 🔹 numeric field
      qty: formData.qty ? Number(formData.qty) : 0,
      transfer_qty: formData.transfer_qty ? Number(formData.transfer_qty) : 0,
      experience_years: formData.experience_years
        ? Number(formData.experience_years)
        : null,
      contract_duration:
        formData.contract_type === "contract"
          ? Number(formData.contract_duration)
          : null,

      // 🔹 date
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
    router.back(); // ini akan kembali ke halaman sebelumnya
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
          "No response from server (check backend/CORS)."
        );
      } else {
        showAlert("Error", "error", error.message || "Unknown error");
      }
    }
  };

  // ✅ KOMPONEN BARU: EmployeeSelect dengan Autocomplete seperti ESS Leave
  const EmployeeSelect = ({ value, onChange, label }) => {
    const [localQuery, setLocalQuery] = useState("");
    const [localOptions, setLocalOptions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
      // Reset jika query kosong
      if (!localQuery || localQuery.trim().length === 0) {
        setLocalOptions([]);
        setIsSearching(false);
        return;
      }

      // Set loading state
      setIsSearching(true);

      const timeout = setTimeout(async () => {
        try {
          const res = await axios.get(`${API_URL}/api/employee`, {
            headers: {
              Authorization: "Bearer " + user.token,
            },
            params: {
              search: localQuery.trim(),
            },
          });

          // Map hasil search
          const options = res.data.map((emp) => ({
            badge_number: emp.badge_number,
            full_name: emp.full_name,
            label: `${emp.badge_number} - ${emp.full_name}`,
          }));

          setLocalOptions(options);
        } catch (err) {
          console.error("Employee search error:", err);
          setLocalOptions([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);

      return () => {
        clearTimeout(timeout);
        setIsSearching(false);
      };
    }, [localQuery]);

    // Find display value from badge_number
    const displayValue =
      localOptions.find((o) => o.badge_number === value)?.label || 
      (value ? `${value}` : "");

    return (
      <div>
        <Autocomplete
          placeholder="Type badge number or full name"
          value={localQuery || displayValue}
          data={localOptions.map((o) => o.label)}
          onChange={(val) => {
            setLocalQuery(val);
            
            // Cek apakah user memilih dari dropdown
            const selected = localOptions.find((o) => o.label === val);
            
            if (selected) {
              // User memilih dari dropdown
              onChange(selected.badge_number);
              setLocalQuery(selected.label); // Set ke label lengkap
            } else if (!val || val.trim() === "") {
              // User clear input
              onChange(null);
              setLocalQuery("");
            }
            // Jika user masih mengetik, biarkan localQuery terupdate untuk trigger search
          }}
          limit={20}
          nothingFoundMessage={
            isSearching 
              ? "Searching..." 
              : localQuery.trim().length > 0 
                ? "No employee found" 
                : "Start typing to search"
          }
        />

        {/* Status Indicators */}
        {value && !isSearching && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex flex-col">
            <Text size="xs" c="green" fw={600}>
              ✓ Employee Selected
            </Text>
            <Text size="xs" c="dimmed">
              Badge: {value}
            </Text>
          </div>
        )}
        {localQuery && !value && localOptions.length > 0 && !isSearching && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <Text size="xs" c="orange" fw={500}>
              ⚠ Please select an item from the available list
            </Text>
          </div>
        )}
        {isSearching && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <Text size="xs" c="blue" fw={500}>
              🔍 Searching...
            </Text>
          </div>
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
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Project"
                    data={projects}
                    value={formData.id_project}
                    onChange={(val) => handleInputChange("id_project", val)}
                    searchable
                  />
                </Grid.Col>
              </Grid>

              <Divider my="lg" />
              {/* Section 2: Position Vacant */}
              <h3 className="text-md font-semibold mb-4">Position Vacant</h3>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Job Title"
                    data={job_title}
                    value={formData.id_job_title}
                    onChange={(val) => handleInputChange("id_job_title", val)}
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
                        e.target.checked ? "new_position" : ""
                      )
                    }
                  />
                  <Checkbox
                    label="Replacement"
                    checked={formData.vacant_type === "replacement"}
                    onChange={(e) =>
                      handleInputChange(
                        "vacant_type",
                        e.target.checked ? "replacement" : ""
                      )
                    }
                  />
                </div>
              </div>

              <Divider my="lg" />
              {/* Section 1: Annual Budget */}
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

              {/* Section 2: Job Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  2. Job Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Input Job Description"
                  minRows={4}
                  value={formData.job_description}
                  onChange={(e) =>
                    handleInputChange("job_description", e.target.value)
                  }
                />
              </div>
              {/* Section 3: Years of Relevant Experience */}
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
              {/* Section 4: Educational Background */}
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
                      {/* Checkbox */}
                      <Checkbox
                        label={item.label}
                        checked={formData.education_level.includes(item.key)}
                        onChange={(e) =>
                          handleEducationChange(item.key, e.target.checked)
                        }
                      />

                      {/* Text Input */}
                      <TextInput
                        placeholder={
                          item.key === "others"
                            ? "Additional info"
                            : "Additional info"
                        }
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

              <label className="block text-sm font-medium mb-3">
                5. Contract Type <span className="text-red-500">*</span>
              </label>

              <div className="space-y-3 ml-4">
                {/* Probation / Permanent */}
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

                {/* Contract / Temporary */}
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

              {/* Section 6: Information Technology Facilities */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-4">
                  6. Information Technology Facilities
                </h3>

                {/* Computer & Email */}
                <div className="mb-6">
                  <div className="space-y-2 ml-4">
                    <Checkbox
                      label="Computer"
                      checked={formData.access.includes("computer")}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "access",
                          "computer",
                          e.target.checked
                        )
                      }
                    />
                    <Checkbox
                      label="Email"
                      checked={formData.access.includes("email")}
                      onChange={(e) =>
                        handleCheckboxChange("access", "email", e.target.checked)
                      }
                    />
                  </div>
                </div>

                {/* Share Folder */}
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
                          e.target.checked
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
                          e.target.checked
                        )
                      }
                    />
                  </div>
                </div>

                {/* Printer */}
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
                          e.target.checked
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
                          e.target.checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Section 7: Application */}
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
                        e.target.checked
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
                        e.target.checked
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

              {/* Section 8: Purpose & Required Date */}
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

              {/* Section 9: Assignment - DENGAN AUTOCOMPLETE */}
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
                  <Table.Tr>
                    <Table.Td>Requested By (End User)</Table.Td>
                    <Table.Td>
                      <EmployeeSelect
                        value={formData.requested_by}
                        onChange={(val) =>
                          handleInputChange("requested_by", val)
                        }
                      />
                    </Table.Td>
                  </Table.Tr>

                  <Table.Tr>
                    <Table.Td>Approved By Section Manager</Table.Td>
                    <Table.Td>
                      <EmployeeSelect
                        value={formData.approved_section_manager}
                        onChange={(val) =>
                          handleInputChange("approved_section_manager", val)
                        }
                      />
                    </Table.Td>
                  </Table.Tr>

                  <Table.Tr>
                    <Table.Td>Approved By (CM)</Table.Td>
                    <Table.Td>
                      <EmployeeSelect
                        value={formData.approved_cm}
                        onChange={(val) => handleInputChange("approved_cm", val)}
                      />
                    </Table.Td>
                  </Table.Tr>

                  <Table.Tr>
                    <Table.Td>Concurred By (PMO)</Table.Td>
                    <Table.Td>
                      <EmployeeSelect
                        value={formData.concurred_pmo}
                        onChange={(val) =>
                          handleInputChange("concurred_pmo", val)
                        }
                      />
                    </Table.Td>
                  </Table.Tr>

                  <Table.Tr>
                    <Table.Td>Concurred Yard Manager</Table.Td>
                    <Table.Td>
                      <EmployeeSelect
                        value={formData.concurred_yard_manager}
                        onChange={(val) =>
                          handleInputChange("concurred_yard_manager", val)
                        }
                      />
                    </Table.Td>
                  </Table.Tr>

                  <Table.Tr>
                    <Table.Td>Concurred By</Table.Td>
                    <Table.Td>
                      <EmployeeSelect
                        value={formData.concurred_by}
                        onChange={(val) =>
                          handleInputChange("concurred_by", val)
                        }
                      />
                    </Table.Td>
                  </Table.Tr>

                  <Table.Tr>
                    <Table.Td>Acknowledged By HR</Table.Td>
                    <Table.Td>
                      <EmployeeSelect
                        value={formData.acknowledged_by}
                        onChange={(val) =>
                          handleInputChange("acknowledged_by", val)
                        }
                      />
                    </Table.Td>
                  </Table.Tr>

                  <Table.Tr>
                    <Table.Td>Approved By (President Director)</Table.Td>
                    <Table.Td>
                      <EmployeeSelect
                        value={formData.approved_by}
                        onChange={(val) =>
                          handleInputChange("approved_by", val)
                        }
                      />
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>

              <Divider my="lg" />

              {/* Submit Button */}
              <Group justify="flex-end" mt="xl">
                <Button
                  size="md"
                  onClick={handleSubmit}
                  leftSection={<span>✓</span>}
                >
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
