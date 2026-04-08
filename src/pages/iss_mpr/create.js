import AuthLayout from "@/components/layout/authLayout";
import { mprOnly } from "@/data/sidebar/employee";
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
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const EMPLOYEE_STATUS = [
  { value: "1", label: "In Direct" },
  { value: "2", label: "Direct" },
];

const EDUCATION_ITEMS = [
  { key: "degree",      label: "Degree" },
  { key: "diploma",     label: "Diploma" },
  { key: "high_school", label: "High School" },
  { key: "others",      label: "Others" },
];

const INITIAL_FORM = {
  id_departement: "",
  id_project:     "",
  id_position:    "",
  work_type:      "",
  qty:            "",
  transfer_qty:   "",
  vacant_type:    "",
  budgeted:       "",
  job_description:  "",
  experience_years: "",
  education_level:  [],
  education_note:   {},
  contract_type:     "",
  contract_duration: "",
  access:       [],
  share_folder: [],
  printer:      [],
  application:  [],
  purpose:       "",
  required_date: null,
  remarks:       "",
  requested_by:    null,
  concurred_by:    null,
  acknowledged_by: null,
  approved_by:     null,
};

export default function IssMprCreate() {
  const router       = useRouter();
  const { user }     = useUser();
  const { API_URL }  = useApi();
  const { showAlert } = useSwal();

  const [errors,      setErrors]      = useState({});
  const [departements, setDepartments] = useState([]);
  const [projects,    setProjects]    = useState([]);
  const [positions,   setPositions]   = useState([]);
  const [formData,    setFormData]    = useState(INITIAL_FORM);

  // ─── Dropdown ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDropdown = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/iss_mpr/dropdowns`, {
          headers: { Authorization: "Bearer " + user.token },
        });
        setDepartments(data.departements.map((d) => ({ value: d.id.toString(), label: d.departement_name })));
        setProjects(data.projects.map((p) => ({ value: p.id.toString(), label: p.project_name })));
        setPositions(data.position_name.map((p) => ({ value: p.id.toString(), label: p.position_name })));
      } catch (err) {
        console.error("Dropdown error:", err);
      }
    };
    fetchDropdown();
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleCheckboxChange = (field, value, checked) =>
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter((v) => v !== value),
    }));

  const handleEducationChange = (key, checked) =>
    setFormData((prev) => ({
      ...prev,
      education_level: checked
        ? [...prev.education_level, key]
        : prev.education_level.filter((v) => v !== key),
    }));

  const handleEducationNoteChange = (key, value) =>
    setFormData((prev) => ({
      ...prev,
      education_note: { ...prev.education_note, [key]: value },
    }));

  const normalizeUserId = (val) => {
    if (!val) return null;
    if (typeof val === "object") return val.id_user ?? null;
    return Number(val);
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validateForm = () => {
    const e = {};
    if (!formData.id_departement)   e.id_departement   = "Department is required";
    if (!formData.id_project)       e.id_project       = "Project is required";
    if (!formData.id_position)      e.id_position      = "Position is required";
    if (!formData.work_type)        e.work_type        = "Employee Status is required";
    if (!formData.qty)              e.qty              = "Qty is required";
    if (!formData.vacant_type)      e.vacant_type      = "Vacant Type is required";
    if (!formData.budgeted)         e.budgeted         = "Annual Budget option is required";
    if (!formData.experience_years) e.experience_years = "Years of Experience is required";
    if (!formData.education_level.length) e.education_level = "At least one Education is required";
    if (!formData.contract_type)    e.contract_type    = "Contract Type is required";
    if (formData.contract_type === "contract" && !formData.contract_duration)
      e.contract_duration = "Contract Duration is required";
    if (!formData.access.length)        e.access        = "At least one IT Access is required";
    if (!formData.share_folder.length)  e.share_folder  = "Share Folder is required";
    if (!formData.purpose)          e.purpose       = "Purpose is required";
    if (!formData.required_date)    e.required_date = "Required Date is required";
    if (!formData.remarks)          e.remarks       = "Remarks is required";
    if (!formData.requested_by)     e.requested_by  = "Requested By is required";
    if (!formData.concurred_by)     e.concurred_by  = "Concurred By is required";
    if (!formData.acknowledged_by)  e.acknowledged_by = "Acknowledged By is required";
    if (!formData.approved_by)      e.approved_by   = "Approved By is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const confirm = await showAlert(
      "Are you sure?", "question",
      "Do you want to submit this Manpower Request?",
      true, null, "Submit", "Cancel",
    );
    if (!confirm?.isConfirmed) return;

    const payload = {
      ...formData,
      id_departement: Number(formData.id_departement),
      id_project:     Number(formData.id_project),
      id_position:    Number(formData.id_position),
      qty:            formData.qty      ? Number(formData.qty)      : null,
      transfer_qty:   formData.transfer_qty ? Number(formData.transfer_qty) : null,
      experience_years: formData.experience_years ? Number(formData.experience_years) : null,
      contract_duration: formData.contract_type === "contract" ? Number(formData.contract_duration) : null,
      required_date:  formData.required_date ? formData.required_date.toISOString() : null,
    };

    try {
      const res  = await axios.post(`${API_URL}/api/iss_mpr/create`, payload, {
        headers: { Authorization: "Bearer " + user.token },
      });
      const data = res.data;
      const ok   = !!(data && (data.success === true || data.id || data.createdAt || data.data));

      if (ok) {
        await showAlert("Success", "success", data?.message || "MPR created successfully", false, 1500);
        router.back();
        return;
      }
      showAlert("Error", "error", data?.message || "Unexpected response from server");
    } catch (error) {
      const err = error.response?.data;
      if (err)          showAlert(err.message || "Failed to create MPR", "error", err.error || "");
      else if (error.request) showAlert("Network Error", "error", "No response from server (check backend/CORS).");
      else                    showAlert("Error", "error", error.message || "Unknown error");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <AuthLayout sidebarList={mprOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>

            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconArrowLeft
                size={20}
                onClick={() => router.back()}
                className="cursor-pointer hover:text-blue-600 transition-colors"
              />
              <h2 className="text-lg font-semibold">Create Manpower Request</h2>
            </div>

            <div className="p-6">

              {/* Department & Project */}
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Department" searchable withAsterisk
                    data={departements}
                    value={formData.id_departement}
                    onChange={(val) => {
                      handleInputChange("id_departement", val);
                      setErrors((prev) => ({ ...prev, id_departement: null }));
                    }}
                    error={errors.id_departement}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Project" searchable withAsterisk
                    data={projects}
                    value={formData.id_project}
                    onChange={(val) => handleInputChange("id_project", val)}
                    error={errors.id_project}
                  />
                </Grid.Col>
              </Grid>

              <Divider my="lg" />

              {/* Position Vacant */}
              <h3 className="text-md font-semibold mb-4">Position Vacant</h3>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Position" searchable withAsterisk
                    data={positions}
                    value={formData.id_position}
                    onChange={(val) => handleInputChange("id_position", val)}
                    error={errors.id_position}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Employee Status" placeholder="Select Employee Status" withAsterisk
                    data={EMPLOYEE_STATUS}
                    value={formData.work_type}
                    onChange={(val) => handleInputChange("work_type", val)}
                    error={errors.work_type}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    type="number" label="Qty" placeholder="Total Person" withAsterisk
                    description={<span className="text-cyan-500 italic text-xs">*QTY = (New Join QTY + Transferred QTY)</span>}
                    value={formData.qty}
                    onChange={(e) => handleInputChange("qty", e.target.value)}
                    error={errors.qty}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Transfer Qty" placeholder="Total Transfer Employee"
                    description={<span className="text-red-500 italic text-xs">*Fill this column if there any transfer employee on this MPR!</span>}
                    value={formData.transfer_qty}
                    onChange={(e) => handleInputChange("transfer_qty", e.target.value)}
                    error={errors.transfer_qty}
                  />
                </Grid.Col>
              </Grid>

              {/* Vacant Type */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Please choose one <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <Checkbox
                    label="New Position"
                    checked={formData.vacant_type === "new_position"}
                    onChange={(e) => handleInputChange("vacant_type", e.target.checked ? "new_position" : "")}
                  />
                  <Checkbox
                    label="Replacement"
                    checked={formData.vacant_type === "replacement"}
                    onChange={(e) => handleInputChange("vacant_type", e.target.checked ? "replacement" : "")}
                  />
                </div>
                {errors.vacant_type && <p className="text-red-500 text-xs mt-1">{errors.vacant_type}</p>}
              </div>

              <Divider my="lg" />

              {/* 1. Annual Budget */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  1. Is the above manpower request budgeted for in the Annual Budget?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 ml-4">
                  <Checkbox label="Yes" checked={formData.budgeted === "yes"} onChange={() => handleInputChange("budgeted", "yes")} />
                  <Checkbox label="No"  checked={formData.budgeted === "no"}  onChange={() => handleInputChange("budgeted", "no")} />
                </div>
                {errors.budgeted && <p className="text-red-500 text-xs mt-1">{errors.budgeted}</p>}
              </div>

              {/* 2. Job Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  2. Job Description <span className="text-red-500">*</span>
                </label>
                <ReactQuill
                  theme="snow"
                  value={formData.job_description}
                  onChange={(val) => handleInputChange("job_description", val)}
                  modules={{ toolbar: [["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], ["clean"]] }}
                />
              </div>

              {/* 3. Years of Experience */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  3. Years of Relevant Experience <span className="text-red-500">*</span>
                </label>
                <TextInput
                  placeholder="Input Years of Relevant Experience"
                  value={formData.experience_years}
                  onChange={(e) => handleInputChange("experience_years", e.target.value)}
                  error={errors.experience_years}
                />
              </div>

              <Divider my="lg" />

              {/* 4. Educational Background */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-4">
                  4. Educational Background <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3 ml-4">
                  {EDUCATION_ITEMS.map((item) => (
                    <div key={item.key} className="grid grid-cols-[180px_1fr] items-center gap-4">
                      <Checkbox
                        label={item.label}
                        checked={formData.education_level.includes(item.key)}
                        onChange={(e) => handleEducationChange(item.key, e.target.checked)}
                      />
                      <TextInput
                        placeholder="Additional info"
                        value={formData.education_note[item.key] || ""}
                        onChange={(e) => handleEducationNoteChange(item.key, e.target.value)}
                        disabled={!formData.education_level.includes(item.key)}
                      />
                    </div>
                  ))}
                </div>
                {errors.education_level && <p className="text-red-500 text-xs mt-2">{errors.education_level}</p>}
              </div>

              {/* 5. Contract Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  5. Contract Type <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3 ml-4">
                  <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <Checkbox
                      label="Probation / Permanent"
                      checked={formData.contract_type === "permanent"}
                      onChange={() => handleInputChange("contract_type", "permanent")}
                    />
                    <div />
                  </div>
                  <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <Checkbox
                      label="Contract / Temporary"
                      checked={formData.contract_type === "contract"}
                      onChange={() => handleInputChange("contract_type", "contract")}
                    />
                    <div className="flex items-center gap-2">
                      <TextInput
                        type="number" placeholder="Contract Duration" className="w-40"
                        value={formData.contract_duration}
                        onChange={(e) => handleInputChange("contract_duration", e.target.value)}
                        disabled={formData.contract_type !== "contract"}
                        error={errors.contract_duration}
                      />
                      <span className="text-sm text-gray-600">Month</span>
                    </div>
                  </div>
                </div>
                {errors.contract_type && <p className="text-red-500 text-xs mt-1">{errors.contract_type}</p>}
              </div>

              <Divider my="lg" />

              {/* 6. IT Facilities */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-4">
                  6. Information Technology Facilities <span className="text-red-500">*</span>
                </h3>

                <div className="mb-6">
                  <div className="space-y-2 ml-4">
                    <Checkbox label="Computer" checked={formData.access.includes("computer")} onChange={(e) => handleCheckboxChange("access", "computer", e.target.checked)} />
                    <Checkbox label="Email"    checked={formData.access.includes("email")}    onChange={(e) => handleCheckboxChange("access", "email",    e.target.checked)} />
                  </div>
                  {errors.access && <p className="text-red-500 text-xs mt-1 ml-4">{errors.access}</p>}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Share Folder</label>
                  <div className="space-y-2 ml-4">
                    <Checkbox label="Public"     checked={formData.share_folder.includes("public")}     onChange={(e) => handleCheckboxChange("share_folder", "public",     e.target.checked)} />
                    <Checkbox label="Department" checked={formData.share_folder.includes("department")} onChange={(e) => handleCheckboxChange("share_folder", "department", e.target.checked)} />
                  </div>
                  {errors.share_folder && <p className="text-red-500 text-xs mt-1 ml-4">{errors.share_folder}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">Printer</label>
                  <div className="space-y-2 ml-4">
                    <Checkbox label="Color"        checked={formData.printer.includes("color")}       onChange={(e) => handleCheckboxChange("printer", "color",       e.target.checked)} />
                    <Checkbox label="Black / White" checked={formData.printer.includes("black_white")} onChange={(e) => handleCheckboxChange("printer", "black_white", e.target.checked)} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">Application</label>
                  <div className="space-y-2 ml-4">
                    <Checkbox label="Employee Service System" checked={formData.application.includes("self_service")} onChange={(e) => handleCheckboxChange("application", "self_service", e.target.checked)} />
                    <Checkbox label="PCMS/ISS"                checked={formData.application.includes("pcms_iss")}    onChange={(e) => handleCheckboxChange("application", "pcms_iss",    e.target.checked)} />
                    <span className="text-red-500 italic text-xs ml-6">*For Authorized Personnel Only</span>
                  </div>
                </div>
              </div>

              <Divider my="lg" />

              {/* Purpose, Date, Remarks */}
              <Grid>
                <Grid.Col span={12}>
                  <Textarea
                    label="Purpose for Request" placeholder="Input Purpose of Request"
                    minRows={3} withAsterisk
                    value={formData.purpose}
                    onChange={(e) => handleInputChange("purpose", e.target.value)}
                    error={errors.purpose}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <DateInput
                    label="Required Date" placeholder="dd/mm/yyyy" valueFormat="DD/MM/YYYY" withAsterisk
                    value={formData.required_date}
                    onChange={(val) => handleInputChange("required_date", val)}
                    error={errors.required_date}
                  />
                  <span className="text-red-500 italic text-xs">*Minimum 30 days After Create</span>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Remarks" placeholder="Ex : Transfer from Sofia"
                    minRows={3} withAsterisk
                    value={formData.remarks}
                    onChange={(e) => handleInputChange("remarks", e.target.value)}
                    error={errors.remarks}
                  />
                </Grid.Col>
              </Grid>

              <Divider my="lg" />

              {/* Assignment */}
              <h3 className="text-md font-semibold mb-4">Assignment</h3>
              <Table withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th className="bg-gray-100">Process</Table.Th>
                    <Table.Th className="bg-gray-100">User Assign <span className="text-red-500">*</span></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {[
                    { label: "Requested By (End User)",      field: "requested_by" },
                    { label: "Concurred By Manager",         field: "concurred_by" },
                    { label: "Acknowledged By HR",           field: "acknowledged_by" },
                    { label: "Approved By (President Director)", field: "approved_by" },
                  ].map(({ label, field }) => (
                    <Table.Tr key={field}>
                      <Table.Td>{label}</Table.Td>
                      <Table.Td>
                        <ManagerSelect
                          value={formData[field]}
                          onChange={(val) => handleInputChange(field, normalizeUserId(val))}
                        />
                        {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              <Divider my="lg" />

              <Group justify="flex-end" mt="xl">
                <Button onClick={handleSubmit}>Submit</Button>
              </Group>

            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}