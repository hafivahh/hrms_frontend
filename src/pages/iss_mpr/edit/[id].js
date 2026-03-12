import AuthLayout from "@/components/layout/authLayout";
import ManagerSelect from "@/components/ManagerSelect";
import { mprOnly } from "@/data/sidebar/employee";
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
// Tambahkan di import atas (sama seperti create)
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
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
        requested_by: mapAssignment(0),
        approved_section_manager: mapAssignment(1),
        approved_cm: mapAssignment(2),
        concurred_pmo: mapAssignment(3),
        concurred_yard_manager: mapAssignment(4),
        concurred_by: mapAssignment(5),
        acknowledged_by: mapAssignment(6),
        approved_by: mapAssignment(7),
      });
      // ==========================
      // 🔥 TAMBAHAN: MAP ASSIGNMENT → formData (UNTUK EDIT)
      // ==========================
      setFormData((prev) => ({
        ...prev,
        requested_by:
          mpr.assignments?.find((a) => a.index === 0)?.user_id?.toString() ??
          null,
        approved_section_manager:
          mpr.assignments?.find((a) => a.index === 1)?.user_id?.toString() ??
          null,
        approved_cm:
          mpr.assignments?.find((a) => a.index === 2)?.user_id?.toString() ??
          null,
        concurred_pmo:
          mpr.assignments?.find((a) => a.index === 3)?.user_id?.toString() ??
          null,
        concurred_yard_manager:
          mpr.assignments?.find((a) => a.index === 4)?.user_id?.toString() ??
          null,
        concurred_by:
          mpr.assignments?.find((a) => a.index === 5)?.user_id?.toString() ??
          null,
        acknowledged_by:
          mpr.assignments?.find((a) => a.index === 6)?.user_id?.toString() ??
          null,
        approved_by:
          mpr.assignments?.find((a) => a.index === 7)?.user_id?.toString() ??
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

  const validateForm = () => {
    // Section 1–2: Department & Project & Position & Work Type & Qty
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

    // Section 2: Transfer Qty (boleh kosong kalau optional)
    // if (!formData.transfer_qty) { ... }

    // Vacant Type
    if (!formData.vacant_type) {
      showAlert("Information", "info", "Please select Vacant Type", "Oke");
      return false;
    }

    // Budgeted
    if (!formData.is_budgeted) {
      showAlert(
        "Information",
        "info",
        "Please select if this manpower request is budgeted",
        "Oke",
      );
      return false;
    }

    // Job Description
    if (
      !formData.job_description ||
      formData.job_description === "<p><br></p>"
    ) {
      showAlert("Information", "info", "Please input Job Description", "Oke");
      return false;
    }

    // Experience
    if (!formData.experience_years) {
      showAlert(
        "Information",
        "info",
        "Please input Years of Relevant Experience",
        "Oke",
      );
      return false;
    }

    // Contract Type
    if (!formData.contract_type) {
      showAlert("Information", "info", "Please select Contract Type", "Oke");
      return false;
    }
    if (formData.contract_type === "contract" && !formData.contract_duration) {
      showAlert(
        "Information",
        "info",
        "Please input Contract Duration for Contract Type",
        "Oke",
      );
      return false;
    }

    // Education: jika checkbox dicek, note wajib
    for (const key of formData.education_level) {
      if (
        !formData.education_note[key] ||
        formData.education_note[key] === ""
      ) {
        showAlert(
          "Information",
          "info",
          `Please input Education note for ${key}`,
          "Oke",
        );
        return false;
      }
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
    if (formData.printer.length === 0) {
      showAlert(
        "Information",
        "info",
        "Please select at least one Printer option",
        "Oke",
      );
      return false;
    }
    if (formData.application.length === 0) {
      showAlert(
        "Information",
        "info",
        "Please select at least one Application",
        "Oke",
      );
      return false;
    }

    // Section 10: Purpose, Required Date & Remarks
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
      showAlert("Information", "info", "Please input Required Date", "Oke");
      return false;
    }
    if (!formData.remarks) {
      showAlert("Information", "info", "Please input Remarks", "Oke");
      return false;
    }

    // Section Assignment
    const assignmentFields = ["requested_by", "approved_by", "acknowledged_by"];

    if (formData.id_project !== "11") {
      assignmentFields.push(
        "approved_section_manager",
        "approved_cm",
        "concurred_pmo",
        "concurred_yard_manager",
      );
    } else {
      assignmentFields.push("concurred_by");
    }

    for (const field of assignmentFields) {
      if (!formData[field]) {
        showAlert(
          "Information",
          "info",
          `Please select ${field.replace(/_/g, " ")}`,
          "Oke",
        );
        return false;
      }
    }

    return true; // Semua valid
  };

  const handleSave = async () => {
    console.log("=== handleSave called ==="); // ⬅️ step 1

    if (!validateForm()) {
      console.log("=== validateForm FAILED ==="); // ⬅️ step 2
      return;
    }

    console.log("=== validateForm PASSED ==="); // ⬅️ step 3

    try {
      const confirm = await showAlert(
        "Are you sure?",
        "question",
        "Do you want to save changes to this Manpower Request?",
        true,
        null,
        "Submit",
        "Cancel",
      );

      console.log("=== confirm result ===", confirm); // ⬅️ step 4

      if (!confirm?.isConfirmed) {
        console.log("=== User cancelled ===");
        return;
      }

      const decryptedId = decrypt(id);
      console.log("=== decryptedId ===", decryptedId); // ⬅️ step 5
      console.log("=== formData ===", formData); // ⬅️ step 6

      // ... sisa kode sama

      const educationMap = {
        degree: 1,
        diploma: 2,
        high_school: 3,
        others: 4,
      };

      //  BUILD ASSIGNMENTS ARRAY
      const assignments = [];

      if (formData.id_project !== "11") {
        // Project biasa: index 0,1,2,3,4,6,7
        const normalMapping = [
          { key: "requested_by", index: 0 },
          { key: "approved_section_manager", index: 1 },
          { key: "approved_cm", index: 2 },
          { key: "concurred_pmo", index: 3 },
          { key: "concurred_yard_manager", index: 4 },
          { key: "acknowledged_by", index: 6 },
          { key: "approved_by", index: 7 },
        ];

        for (const map of normalMapping) {
          const userId = toIntOrNull(formData[map.key]);
          if (userId) {
            assignments.push({
              index: map.index,
              user_id: userId,
            });
          }
        }
      } else {
        // Project overhead (id=11): index 0,5,6,7
        const overheadMapping = [
          { key: "requested_by", index: 0 },
          { key: "concurred_by", index: 5 },
          { key: "acknowledged_by", index: 6 },
          { key: "approved_by", index: 7 },
        ];

        for (const map of overheadMapping) {
          const userId = toIntOrNull(formData[map.key]);
          if (userId) {
            assignments.push({
              index: map.index,
              user_id: userId,
            });
          }
        }
      }

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
        //  ASSIGNMENT FORMAT BARU (ARRAY)
        // =========================
        assignments: assignments,
      };

      console.log(" Payload being sent:", payload);
      console.log(" Assignments count:", assignments.length);
      console.log(" Assignments:", assignments);

      //  Kirim request update
      await axios.patch(`${API_URL}/api/iss_mpr/${decryptedId}`, payload, {
        headers: { Authorization: "Bearer " + user.token },
      });

      //  Success alert
      await showAlert(
        "Success",
        "success",
        "MPR updated successfully",
        false,
        1500,
      );

      //  Redirect ke list
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      showAlert(
        "Error",
        "error",
        err.response?.data?.message || "Failed to update MPR",
      );
    }
  };

  if (loading) {
    return (
      <AuthLayout sidebarList={mprOnly}>
        <Paper radius="sm" mt="md" withBorder p="lg">
          <Text>Loading...</Text>
        </Paper>
      </AuthLayout>
    );
  }

  if (!mprData) {
    return (
      <AuthLayout sidebarList={mprOnly}>
        <Paper radius="sm" mt="md" withBorder p="lg">
          <Text>MPR not found</Text>
        </Paper>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout sidebarList={mprOnly}>
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
              <h2 className="text-lg font-semibold">
                Edit MPR - {mprData.mpr_no}
              </h2>
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
                          handleInputChange(
                            "requested_by",
                            normalizeUserId(val),
                          )
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
                              handleInputChange(
                                "approved_cm",
                                normalizeUserId(val),
                              )
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
                              handleInputChange(
                                "concurred_pmo",
                                normalizeUserId(val),
                              )
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
                            handleInputChange(
                              "concurred_by",
                              normalizeUserId(val),
                            )
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
                          handleInputChange(
                            "acknowledged_by",
                            normalizeUserId(val),
                          )
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
              <div className="mt-8 flex justify-end">
                <Button onClick={handleSave} color="blue" size="xs">
                  Update MPR
                </Button>
              </div>
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
