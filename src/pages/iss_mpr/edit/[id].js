import AuthLayout from "@/components/layout/authLayout";
import ManagerSelect from "@/components/ManagerSelect";
import { mprOnly } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import axios from "axios";
import useUser from "@/store/useUser";
import useDecrypt from "@/hooks/useDecrypt";
import useSwal from "@/hooks/useSwal";
import {
  Paper,
  TextInput,
  Textarea,
  Checkbox,
  Grid,
  Divider,
  Text,
  Button,
  Select,
  Table,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const EDUCATION_ITEMS = [
  { key: "degree",      label: "Degree" },
  { key: "diploma",     label: "Diploma" },
  { key: "high_school", label: "High School" },
  { key: "others",      label: "Others" },
];

const EDUCATION_KEY_MAP = { 1: "degree", 2: "diploma", 3: "high_school", 4: "others" };

const ASSIGNMENT_ROWS = [
  { label: "Requested By (End User)",         field: "requested_by",   index: 0 },
  { label: "Concurred By Manager",            field: "concurred_by",   index: 1 },
  { label: "Acknowledged By HR",              field: "acknowledged_by", index: 2 },
  { label: "Approved By (President Director)", field: "approved_by",   index: 3 },
];

const INITIAL_FORM = {
  id_departement:   "",
  id_project:       "",
  id_position:      "",
  work_type:        "",
  qty:              "",
  transfer_qty:     "",
  vacant_type:      "",
  is_budgeted:      "",
  job_description:  "",
  experience_years: "",
  contract_type:    "",
  contract_duration:"",
  purpose:          "",
  required_date:    "",
  remarks:          "",
  education_level:  [],
  education_note:   {},
  access:           [],
  printer:          [],
  application:      [],
  requested_by:     null,
  concurred_by:     null,
  acknowledged_by:  null,
  approved_by:      null,
};

const editableInputStyle = { input: { backgroundColor: "#ffffff", cursor: "text" } };

const toIntOrNull = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
};

export default function IssMprEdit() {
  const router        = useRouter();
  const { id }        = router.query;
  const { user }      = useUser();
  const { decrypt }   = useDecrypt();
  const { API_URL }   = useApi();
  const { showAlert } = useSwal();

  const [departements, setDepartments] = useState([]);
  const [projects,     setProjects]    = useState([]);
  const [positions,    setPositions]   = useState([]);
  const [mprData,      setMprData]     = useState(null);
  const [loading,      setLoading]     = useState(true);
  const [formData,     setFormData]    = useState(INITIAL_FORM);

  // ─── Dropdowns ────────────────────────────────────────────────────────────
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

  // ─── Fetch MPR Detail ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const fetchMprDetail = async () => {
      try {
        const decryptedId = decrypt(id);
        const { data }    = await axios.get(`${API_URL}/api/iss_mpr/${decryptedId}`, {
          headers: { Authorization: "Bearer " + user.token },
        });
        const mpr = data.data;
        setMprData(mpr);

        // Education
        const eduDetails = mpr.details?.filter((d) => d.detail_type === 1) || [];
        const education_level = eduDetails.map((d) => EDUCATION_KEY_MAP[d.detail_key] || d.detail_key);
        const education_note  = eduDetails.reduce((acc, d) => {
          acc[EDUCATION_KEY_MAP[d.detail_key] || d.detail_key] = d.detail_value;
          return acc;
        }, {});

        // IT Details
        const access      = mpr.details?.filter((d) => d.detail_type === 2).map((d) => d.detail_value) || [];
        const printer     = mpr.details?.filter((d) => d.detail_type === 3).map((d) => d.detail_value) || [];
        const application = mpr.details?.filter((d) => d.detail_type === 4).map((d) => d.detail_value) || [];

        // Assignments — pakai index baru (0,1,2,3)
        const getAssign = (index) =>
          mpr.assignments?.find((a) => a.index === index)?.user_id?.toString() ?? null;

        setFormData({
          id_departement:   mpr.id_departement?.toString() || "",
          id_project:       mpr.id_project?.toString()     || "",
          id_position:      mpr.id_position?.toString()    || "",
          work_type:        mpr.work_type?.toString()       || "",
          qty:              mpr.qty?.toString()             || "",
          transfer_qty:     mpr.transfer_qty?.toString()    || "",
          vacant_type:      mpr.vacant_type === 1 ? "new_position" : "replacement",
          is_budgeted:      mpr.is_budgeted  === 1 ? "yes" : "no",
          job_description:  mpr.job_description  || "",
          experience_years: mpr.experience_years || "",
          contract_type:    mpr.contract_type === 1 ? "permanent" : "contract",
          contract_duration:mpr.contract_duration || "",
          purpose:          mpr.purpose       || "",
          required_date:    mpr.required_date ? new Date(mpr.required_date).toISOString().split("T")[0] : "",
          remarks:          mpr.remarks       || "",
          education_level,
          education_note,
          access,
          printer,
          application,
          requested_by:    getAssign(0),
          concurred_by:    getAssign(1),
          acknowledged_by: getAssign(2),
          approved_by:     getAssign(3),
        });
      } catch (err) {
        console.error("Failed to fetch MPR detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMprDetail();
  }, [id]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleEducationChange = (key, checked) =>
    setFormData((prev) => ({
      ...prev,
      education_level: checked
        ? [...prev.education_level, key]
        : prev.education_level.filter((k) => k !== key),
    }));

  const handleEducationNoteChange = (key, value) =>
    setFormData((prev) => ({
      ...prev,
      education_note: { ...prev.education_note, [key]: value },
    }));

  const handleCheckboxArrayChange = (field, key, checked) =>
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? [...prev[field], key] : prev[field].filter((k) => k !== key),
    }));

  const normalizeUserId = (val) => {
    if (!val) return null;
    if (typeof val === "object") return val.id_user ?? null;
    return Number(val);
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validateForm = () => {
    const checks = [
      [!formData.id_departement,   "Please select Department"],
      [!formData.id_project,       "Please select Project"],
      [!formData.id_position,      "Please select Position"],
      [!formData.work_type,        "Please select Employee Status"],
      [!formData.qty,              "Please input Qty"],
      [!formData.vacant_type,      "Please select Vacant Type"],
      [!formData.is_budgeted,      "Please select if this manpower request is budgeted"],
      [!formData.job_description || formData.job_description === "<p><br></p>", "Please input Job Description"],
      [!formData.experience_years, "Please input Years of Relevant Experience"],
      [!formData.contract_type,    "Please select Contract Type"],
      [formData.contract_type === "contract" && !formData.contract_duration, "Please input Contract Duration"],
      // [formData.access.length === 0,       "Please select at least one IT Access"],
      // [formData.printer.length === 0,      "Please select at least one Printer option"],
      // [formData.application.length === 0,  "Please select at least one Application"],
      [!formData.purpose,          "Please input Purpose for Request"],
      [!formData.required_date,    "Please input Required Date"],
      [!formData.remarks,          "Please input Remarks"],
      [!formData.requested_by,     "Please select Requested By"],
      [!formData.concurred_by,     "Please select Concurred By Manager"],
      [!formData.acknowledged_by,  "Please select Acknowledged By HR"],
      [!formData.approved_by,      "Please select Approved By"],
    ];

    for (const [condition, message] of checks) {
      if (condition) {
        showAlert("Information", "info", message, "Oke");
        return false;
      }
    }

    for (const key of formData.education_level) {
      if (!formData.education_note[key]) {
        showAlert("Information", "info", `Please input Education note for ${key}`, "Oke");
        return false;
      }
    }

    return true;
  };

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) return;

    const confirm = await showAlert(
      "Are you sure?", "question",
      "Do you want to save changes to this Manpower Request?",
      true, null, "Submit", "Cancel",
    );
    if (!confirm?.isConfirmed) return;

    try {
      const decryptedId = decrypt(id);

      const assignments = ASSIGNMENT_ROWS
        .map(({ field, index }) => ({ index, user_id: toIntOrNull(formData[field]) }))
        .filter((a) => a.user_id);

      const educationMap = { degree: 1, diploma: 2, high_school: 3, others: 4 };

      const payload = {
        id_departement:   toIntOrNull(formData.id_departement),
        id_project:       toIntOrNull(formData.id_project),
        id_position:      toIntOrNull(formData.id_position),
        work_type:        toIntOrNull(formData.work_type),
        qty:              toIntOrNull(formData.qty),
        transfer_qty:     toIntOrNull(formData.transfer_qty),
        vacant_type:      formData.vacant_type,
        budgeted:         formData.is_budgeted,
        job_description:  formData.job_description,
       experience_years: formData.experience_years || null,
        contract_type:    formData.contract_type,
        contract_duration: formData.contract_type === "contract" ? toIntOrNull(formData.contract_duration) : null,
        purpose:          formData.purpose,
        required_date:    formData.required_date || null,
        remarks:          formData.remarks,
        education_level:  formData.education_level.map((lvl) => educationMap[lvl]),
        education_note:   Object.fromEntries(
          Object.entries(formData.education_note).map(([k, v]) => [educationMap[k], v]),
        ),
        access:       formData.access,
        printer:      formData.printer,
        application:  formData.application,
        assignments,
      };

      await axios.patch(`${API_URL}/api/iss_mpr/${decryptedId}`, payload, {
        headers: { Authorization: "Bearer " + user.token },
      });

      await showAlert("Success", "success", "MPR updated successfully", false, 1500);
      router.back();
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      showAlert("Error", "error", err.response?.data?.message || "Failed to update MPR");
    }
  };

  // ─── Loading / Not Found ──────────────────────────────────────────────────
  if (loading) return (
    <AuthLayout sidebarList={mprOnly}>
      <Paper radius="sm" mt="md" withBorder p="lg"><Text>Loading...</Text></Paper>
    </AuthLayout>
  );

  if (!mprData) return (
    <AuthLayout sidebarList={mprOnly}>
      <Paper radius="sm" mt="md" withBorder p="lg"><Text>MPR not found</Text></Paper>
    </AuthLayout>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <AuthLayout sidebarList={mprOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>

            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconArrowLeft size={20} onClick={() => router.back()} className="cursor-pointer hover:text-blue-600 transition-colors" />
              <h2 className="text-lg font-semibold">Edit MPR - {mprData.mpr_no}</h2>
            </div>

            <div className="p-6">

              {/* Department & Project */}
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select label="Department" searchable styles={editableInputStyle}
                    data={departements} value={formData.id_departement}
                    onChange={(val) => handleInputChange("id_departement", val)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select label="Project" searchable styles={editableInputStyle}
                    data={projects} value={formData.id_project}
                    onChange={(val) => handleInputChange("id_project", val)}
                  />
                </Grid.Col>
              </Grid>

              <Divider my="lg" />

              {/* Position Vacant */}
              <h3 className="text-md font-semibold mb-4">Position Vacant</h3>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select label="Position" searchable styles={editableInputStyle}
                    data={positions} value={formData.id_position}
                    onChange={(val) => handleInputChange("id_position", val)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select label="Employee Status" styles={editableInputStyle}
                    data={[{ value: "1", label: "In Direct" }, { value: "2", label: "Direct" }]}
                    value={formData.work_type?.toString()}
                    onChange={(val) => handleInputChange("work_type", val)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput label="Qty" type="number" styles={editableInputStyle}
                    value={formData.qty}
                    onChange={(e) => handleInputChange("qty", e.target.value)}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput label="Transfer Qty" type="number" styles={editableInputStyle}
                    value={formData.transfer_qty}
                    onChange={(e) => handleInputChange("transfer_qty", e.target.value)}
                  />
                </Grid.Col>
              </Grid>

              {/* Vacant Type */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Vacant Type</label>
                <div className="space-y-2">
                  <Checkbox label="New Position"
                    checked={formData.vacant_type === "new_position"}
                    onChange={(e) => handleInputChange("vacant_type", e.currentTarget.checked ? "new_position" : "")}
                  />
                  <Checkbox label="Replacement"
                    checked={formData.vacant_type === "replacement"}
                    onChange={(e) => handleInputChange("vacant_type", e.currentTarget.checked ? "replacement" : "")}
                  />
                </div>
              </div>

              <Divider my="lg" />

              {/* 1. Annual Budget */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  1. Is the above manpower request budgeted for in the Annual Budget?
                </label>
                <div className="space-y-2 ml-4">
                  <Checkbox label="Yes" checked={formData.is_budgeted === "yes"} onChange={() => handleInputChange("is_budgeted", "yes")} />
                  <Checkbox label="No"  checked={formData.is_budgeted === "no"}  onChange={() => handleInputChange("is_budgeted", "no")} />
                </div>
              </div>

              {/* 2. Job Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">2. Job Description</label>
                <ReactQuill
                  theme="snow"
                  value={formData.job_description}
                  onChange={(val) => handleInputChange("job_description", val)}
                  modules={{ toolbar: [["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], ["clean"]] }}
                />
              </div>

              {/* 3. Experience */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">3. Years of Relevant Experience</label>
                <TextInput styles={editableInputStyle}
                  value={formData.experience_years}
                  onChange={(e) => handleInputChange("experience_years", e.target.value)}
                />
              </div>

              <Divider my="lg" />

              {/* 4. Education */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-4">4. Educational Background</label>
                <div className="space-y-3 ml-4">
                  {EDUCATION_ITEMS.map((item) => {
                    const isChecked = formData.education_level.includes(item.key);
                    return (
                      <div key={item.key} className="grid grid-cols-[180px_1fr] items-center gap-4">
                        <Checkbox label={item.label} checked={isChecked}
                          onChange={(e) => handleEducationChange(item.key, e.currentTarget.checked)}
                        />
                        <TextInput
                          value={formData.education_note[item.key] || ""}
                          onChange={(e) => handleEducationNoteChange(item.key, e.target.value)}
                          disabled={!isChecked}
                          styles={isChecked ? editableInputStyle : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. Contract Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">5. Contract Type</label>
                <div className="space-y-3 ml-4">
                  <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <Checkbox label="Probation / Permanent"
                      checked={formData.contract_type === "permanent"}
                      onChange={(e) => handleInputChange("contract_type", e.currentTarget.checked ? "permanent" : "")}
                    />
                    <div />
                  </div>
                  <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <Checkbox label="Contract / Temporary"
                      checked={formData.contract_type === "contract"}
                      onChange={(e) => handleInputChange("contract_type", e.currentTarget.checked ? "contract" : "")}
                    />
                    <div className="flex items-center gap-2">
                      <TextInput className="w-40"
                        value={formData.contract_duration}
                        onChange={(e) => handleInputChange("contract_duration", e.target.value)}
                        disabled={formData.contract_type !== "contract"}
                        styles={formData.contract_type === "contract" ? editableInputStyle : undefined}
                      />
                      <span className="text-sm text-gray-600">Month</span>
                    </div>
                  </div>
                </div>
              </div>

              <Divider my="lg" />

              {/* 6. IT Facilities */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-4">6. Information Technology Facilities</h3>

                <div className="mb-4">
                  <div className="space-y-2 ml-4">
                    <Checkbox label="Computer" checked={formData.access.includes("computer")} onChange={(e) => handleCheckboxArrayChange("access", "computer", e.currentTarget.checked)} />
                    <Checkbox label="Email"    checked={formData.access.includes("email")}    onChange={(e) => handleCheckboxArrayChange("access", "email",    e.currentTarget.checked)} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">Share Folder</label>
                  <div className="space-y-2 ml-4">
                    <Checkbox label="Public"     checked={formData.access.includes("public")}     onChange={(e) => handleCheckboxArrayChange("access", "public",     e.currentTarget.checked)} />
                    <Checkbox label="Department" checked={formData.access.includes("department")} onChange={(e) => handleCheckboxArrayChange("access", "department", e.currentTarget.checked)} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">Printer</label>
                  <div className="space-y-2 ml-4">
                    <Checkbox label="Color"        checked={formData.printer.includes("color")}       onChange={(e) => handleCheckboxArrayChange("printer", "color",       e.currentTarget.checked)} />
                    <Checkbox label="Black / White" checked={formData.printer.includes("black_white")} onChange={(e) => handleCheckboxArrayChange("printer", "black_white", e.currentTarget.checked)} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">Application</label>
                  <div className="space-y-2 ml-4">
                    <Checkbox label="Employee Service System" checked={formData.application.includes("self_service")} onChange={(e) => handleCheckboxArrayChange("application", "self_service", e.currentTarget.checked)} />
                    <Checkbox label="PCMS/ISS"                checked={formData.application.includes("pcms_iss")}    onChange={(e) => handleCheckboxArrayChange("application", "pcms_iss",    e.currentTarget.checked)} />
                    <span className="text-red-500 italic text-xs ml-6">*For Authorized Personnel Only</span>
                  </div>
                </div>
              </div>

              <Divider my="lg" />

              {/* Purpose, Date, Remarks */}
              <Grid>
                <Grid.Col span={12}>
                  <Textarea label="Purpose for Request" minRows={3} styles={editableInputStyle}
                    value={formData.purpose}
                    onChange={(e) => handleInputChange("purpose", e.target.value)}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput label="Required Date" type="date" styles={editableInputStyle}
                    value={formData.required_date}
                    onChange={(e) => handleInputChange("required_date", e.target.value)}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea label="Remarks" minRows={3} styles={editableInputStyle}
                    value={formData.remarks}
                    onChange={(e) => handleInputChange("remarks", e.target.value)}
                  />
                </Grid.Col>
              </Grid>

              <Divider my="lg" />

              {/* Assignment */}
              <h3 className="text-md font-semibold mb-4">Assignment</h3>
              <Table withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Process</Table.Th>
                    <Table.Th>User Assign</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {ASSIGNMENT_ROWS.map(({ label, field }) => (
                    <Table.Tr key={field}>
                      <Table.Td>{label}</Table.Td>
                      <Table.Td>
                        <ManagerSelect
                          value={formData[field]}
                          onChange={(val) => handleInputChange(field, normalizeUserId(val))}
                        />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              <div className="mt-8 flex justify-end">
                <Button onClick={handleSave} color="blue" size="xs">Update MPR</Button>
              </div>

            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}