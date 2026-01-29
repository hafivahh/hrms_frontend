import AuthLayout from "@/components/layout/authLayout";
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
  Button,
  Select,
  NumberInput,
  Radio,
  Group,
  Alert,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconArrowLeft, IconDeviceFloppy, IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";

export default function IssMprEdit() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const { decrypt } = useDecrypt();
  const API = useApi();
  const API_URL = API.API_URL;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dropdown options
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [positions, setPositions] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    id_departement: null,
    id_project: null,
    id_position: null,
    work_type: null,
    qty: 0,
    transfer_qty: 0,
    
    // Vacant Type
    vacant_type: null,
    
    // Budget
    budgeted: null,
    
    // Job Detail
    job_description: "",
    experience_years: "",
    
    // Education
    education_level: [],
    education_note: {},
    
    // Contract
    contract_type: null,
    contract_duration: null,
    
    // IT Facilities
    access: [],
    share_folder: [],
    printer: [],
    application: [],
    
    // Purpose
    purpose: "",
    required_date: null,
    remarks: "",
    
    // Assignments
    requested_by: null,
    approved_section_manager: null,
    approved_cm: null,
    concurred_pmo: null,
    concurred_yard_manager: null,
    concurred_by: null,
    acknowledged_by: null,
    approved_by: null,
  });

  useEffect(() => {
    if (id) {
      fetchInitialData();
    }
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch dropdown data
      await Promise.all([
        fetchDepartments(),
        fetchProjects(),
        fetchPositions(),
        fetchEmployees(),
      ]);
      
      // Fetch MPR detail
      await fetchMprDetail();
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/departement`, {
        headers: { Authorization: "Bearer " + user.token },
      });
      setDepartments(
        data.map((d) => ({
          value: String(d.id),
          label: d.departement_name,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/project`, {
        headers: { Authorization: "Bearer " + user.token },
      });
      setProjects(
        data.map((p) => ({
          value: String(p.id),
          label: p.project_name,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const fetchPositions = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/position`, {
        headers: { Authorization: "Bearer " + user.token },
      });
      setPositions(
        data.map((p) => ({
          value: String(p.id),
          label: p.position_name,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch positions:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/employee`, {
        headers: { Authorization: "Bearer " + user.token },
      });
      setEmployees(
        data.map((e) => ({
          value: e.badge_number,
          label: `${e.badge_number} - ${e.full_name}`,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const fetchMprDetail = async () => {
    try {
      const decryptedId = decrypt(id);
      const { data } = await axios.get(
        `${API_URL}/api/iss_mpr/${decryptedId}`,
        {
          headers: { Authorization: "Bearer " + user.token },
        }
      );

      // Parse education data
      const educationLevels = [];
      const educationNotes = {};
      
      data.details?.forEach((detail) => {
        if (detail.detail_type === 1) {
          // Education
          const eduKey = getEducationKey(detail.detail_key);
          if (eduKey) {
            educationLevels.push(eduKey);
            if (detail.detail_value) {
              educationNotes[eduKey] = detail.detail_value;
            }
          }
        }
      });

      // Parse IT facilities
      const access = data.details
        ?.filter((d) => d.detail_type === 2)
        .map((d) => getAccessKey(d.detail_key))
        .filter(Boolean) || [];
      
      const share_folder = data.details
        ?.filter((d) => d.detail_type === 3)
        .map((d) => getShareFolderKey(d.detail_key))
        .filter(Boolean) || [];
      
      const printer = data.details
        ?.filter((d) => d.detail_type === 4)
        .map((d) => getPrinterKey(d.detail_key))
        .filter(Boolean) || [];
      
      const application = data.details
        ?.filter((d) => d.detail_type === 5)
        .map((d) => getApplicationKey(d.detail_key))
        .filter(Boolean) || [];

      setFormData({
        id_departement: data.id_departement ? String(data.id_departement) : null,
        id_project: data.id_project ? String(data.id_project) : null,
        id_position: data.id_position ? String(data.id_position) : null,
        work_type: data.work_type ? String(data.work_type) : null,
        qty: data.qty || 0,
        transfer_qty: data.transfer_qty || 0,
        vacant_type: data.vacant_type === 1 ? "new_position" : data.vacant_type === 2 ? "replacement" : null,
        budgeted: data.is_budgeted === 1 ? "yes" : data.is_budgeted === 2 ? "no" : null,
        job_description: data.job_description || "",
        experience_years: data.experience_years || "",
        education_level: educationLevels,
        education_note: educationNotes,
        contract_type: data.contract_type || null,
        contract_duration: data.contract_duration || null,
        access,
        share_folder,
        printer,
        application,
        purpose: data.purpose || "",
        required_date: data.required_date ? new Date(data.required_date) : null,
        remarks: data.remarks || "",
        requested_by: data.requestedByEmployee?.badge_number || null,
        approved_section_manager: data.approvedSectionManagerEmployee?.badge_number || null,
        approved_cm: data.approvedCmEmployee?.badge_number || null,
        concurred_pmo: data.concurredPmoEmployee?.badge_number || null,
        concurred_yard_manager: data.concurredYardManagerEmployee?.badge_number || null,
        concurred_by: data.concurredByEmployee?.badge_number || null,
        acknowledged_by: data.acknowledgedByEmployee?.badge_number || null,
        approved_by: data.approvedByEmployee?.badge_number || null,
      });
    } catch (err) {
      console.error("Failed to fetch MPR detail:", err);
      notifications.show({
        title: "Error",
        message: "Failed to load MPR data",
        color: "red",
      });
    }
  };

  // Helper functions to convert detail_key to string keys
  const getEducationKey = (key) => {
    const map = { 1: "degree", 2: "diploma", 3: "high_school", 4: "others" };
    return map[key];
  };

  const getAccessKey = (key) => {
    const map = { 1: "computer", 2: "email" };
    return map[key];
  };

  const getShareFolderKey = (key) => {
    const map = { 1: "public", 2: "department" };
    return map[key];
  };

  const getPrinterKey = (key) => {
    const map = { 1: "black_white", 2: "color" };
    return map[key];
  };

  const getApplicationKey = (key) => {
    const map = { 1: "ess", 2: "pcms_iss" };
    return map[key];
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const decryptedId = decrypt(id);
      
      const payload = {
        ...formData,
        id_departement: formData.id_departement ? Number(formData.id_departement) : null,
        id_project: formData.id_project ? Number(formData.id_project) : null,
        id_position: formData.id_position ? Number(formData.id_position) : null,
      };

      await axios.patch(
        `${API_URL}/api/iss_mpr/${decryptedId}`,
        payload,
        {
          headers: { Authorization: "Bearer " + user.token },
        }
      );

      notifications.show({
        title: "Success",
        message: "MPR updated successfully",
        color: "green",
      });

      router.back();
    } catch (err) {
      console.error("Failed to update MPR:", err);
      notifications.show({
        title: "Error",
        message: err.response?.data?.message || "Failed to update MPR",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEducationChange = (eduLevel, checked) => {
    setFormData((prev) => {
      const newLevels = checked
        ? [...prev.education_level, eduLevel]
        : prev.education_level.filter((e) => e !== eduLevel);
      
      // Remove note if unchecked
      const newNotes = { ...prev.education_note };
      if (!checked) {
        delete newNotes[eduLevel];
      }
      
      return {
        ...prev,
        education_level: newLevels,
        education_note: newNotes,
      };
    });
  };

  const handleEducationNoteChange = (eduLevel, value) => {
    setFormData((prev) => ({
      ...prev,
      education_note: {
        ...prev.education_note,
        [eduLevel]: value,
      },
    }));
  };

  const handleCheckboxArrayChange = (field, value, checked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((v) => v !== value),
    }));
  };

  if (loading) {
    return (
      <AuthLayout sidebarList={employee}>
        <div className="py-6">
          <div className="max-w-full mx-auto sm:px-6 lg:px-8">
            <Paper radius="sm" mt="md" withBorder p="lg">
              Loading...
            </Paper>
          </div>
        </div>
      </AuthLayout>
    );
  }

  const isOverhead = formData.id_project === "11";

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
                <h2 className="text-lg font-semibold">Edit MPR</h2>
              </div>
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSubmit}
                loading={saving}
              >
                Save Changes
              </Button>
            </div>

            {/* FORM CONTENT */}
            <div className="p-6">
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Edit Mode"
                color="blue"
                mb="lg"
              >
                You are editing an existing MPR. Make sure all changes are correct before saving.
              </Alert>

              {/* Section 1: Department & Project */}
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Department"
                    placeholder="Select department"
                    data={departments}
                    value={formData.id_departement}
                    onChange={(value) =>
                      setFormData({ ...formData, id_departement: value })
                    }
                    required
                    searchable
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Project"
                    placeholder="Select project"
                    data={projects}
                    value={formData.id_project}
                    onChange={(value) =>
                      setFormData({ ...formData, id_project: value })
                    }
                    required
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
                    label="Position"
                    placeholder="Select position"
                    data={positions}
                    value={formData.id_position}
                    onChange={(value) =>
                      setFormData({ ...formData, id_position: value })
                    }
                    required
                    searchable
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Employee Status"
                    placeholder="Select employee status"
                    data={[
                      { value: "1", label: "In Direct" },
                      { value: "2", label: "Direct" },
                    ]}
                    value={formData.work_type}
                    onChange={(value) =>
                      setFormData({ ...formData, work_type: value })
                    }
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Qty"
                    placeholder="Enter quantity"
                    value={formData.qty}
                    onChange={(value) =>
                      setFormData({ ...formData, qty: value || 0 })
                    }
                    min={0}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Transfer Qty"
                    placeholder="Enter transfer quantity"
                    value={formData.transfer_qty}
                    onChange={(value) =>
                      setFormData({ ...formData, transfer_qty: value || 0 })
                    }
                    min={0}
                  />
                </Grid.Col>
              </Grid>

              {/* Vacant Type */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Vacant Type <span className="text-red-500">*</span>
                </label>
                <Radio.Group
                  value={formData.vacant_type}
                  onChange={(value) =>
                    setFormData({ ...formData, vacant_type: value })
                  }
                >
                  <Group mt="xs">
                    <Radio value="new_position" label="New Position" />
                    <Radio value="replacement" label="Replacement" />
                  </Group>
                </Radio.Group>
              </div>

              <Divider my="lg" />

              {/* Section 3: Budget */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  1. Is the above manpower request budgeted for in the Annual
                  Budget? <span className="text-red-500">*</span>
                </label>
                <Radio.Group
                  value={formData.budgeted}
                  onChange={(value) =>
                    setFormData({ ...formData, budgeted: value })
                  }
                >
                  <Group mt="xs" ml={16}>
                    <Radio value="yes" label="Yes" />
                    <Radio value="no" label="No" />
                  </Group>
                </Radio.Group>
              </div>

              {/* Section 4: Job Description */}
              <div className="mb-4">
                <Textarea
                  label="2. Job Description"
                  placeholder="Enter job description"
                  value={formData.job_description}
                  onChange={(e) =>
                    setFormData({ ...formData, job_description: e.target.value })
                  }
                  minRows={4}
                  required
                />
              </div>

              {/* Section 5: Experience */}
              <div className="mb-6">
                <TextInput
                  label="3. Years of Relevant Experience"
                  placeholder="e.g., 3-5 years"
                  value={formData.experience_years}
                  onChange={(e) =>
                    setFormData({ ...formData, experience_years: e.target.value })
                  }
                  required
                />
              </div>

              <Divider my="lg" />

              {/* Section 6: Education */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-4">
                  4. Educational Background <span className="text-red-500">*</span>
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
                      className="grid grid-cols-[180px_1fr] items-start gap-4"
                    >
                      <Checkbox
                        label={item.label}
                        checked={formData.education_level.includes(item.key)}
                        onChange={(e) =>
                          handleEducationChange(item.key, e.target.checked)
                        }
                      />
                      <TextInput
                        placeholder={`Specify ${item.label.toLowerCase()}`}
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
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  5. Contract Type <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3 ml-4">
                  <Radio.Group
                    value={formData.contract_type?.toString()}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        contract_type: Number(value),
                        contract_duration:
                          Number(value) === 1 ? null : formData.contract_duration,
                      })
                    }
                  >
                    <div className="space-y-3">
                      <Radio value="1" label="Probation / Permanent" />
                      <div className="flex items-center gap-4">
                        <Radio value="2" label="Contract / Temporary" />
                        <div className="flex items-center gap-2">
                          <NumberInput
                            placeholder="Duration"
                            value={formData.contract_duration}
                            onChange={(value) =>
                              setFormData({ ...formData, contract_duration: value })
                            }
                            disabled={formData.contract_type !== 2}
                            min={1}
                            className="w-32"
                          />
                          <span className="text-sm text-gray-600">Month</span>
                        </div>
                      </div>
                    </div>
                  </Radio.Group>
                </div>
              </div>

              <Divider my="lg" />

              {/* Section 8: IT Facilities */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-4">
                  6. Information Technology Facilities
                </h3>
                
                <label className="block text-sm font-medium mb-3">Access</label>
                <div className="space-y-2 ml-4 mb-4">
                  <Checkbox
                    label="Computer"
                    checked={formData.access.includes("computer")}
                    onChange={(e) =>
                      handleCheckboxArrayChange("access", "computer", e.target.checked)
                    }
                  />
                  <Checkbox
                    label="Email"
                    checked={formData.access.includes("email")}
                    onChange={(e) =>
                      handleCheckboxArrayChange("access", "email", e.target.checked)
                    }
                  />
                </div>

                <label className="block text-sm font-medium mb-3">
                  Share Folder
                </label>
                <div className="space-y-2 ml-4 mb-4">
                  <Checkbox
                    label="Public"
                    checked={formData.share_folder.includes("public")}
                    onChange={(e) =>
                      handleCheckboxArrayChange(
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
                      handleCheckboxArrayChange(
                        "share_folder",
                        "department",
                        e.target.checked
                      )
                    }
                  />
                </div>

                <label className="block text-sm font-medium mb-3">Printer</label>
                <div className="space-y-2 ml-4 mb-4">
                  <Checkbox
                    label="Black / White"
                    checked={formData.printer.includes("black_white")}
                    onChange={(e) =>
                      handleCheckboxArrayChange(
                        "printer",
                        "black_white",
                        e.target.checked
                      )
                    }
                  />
                  <Checkbox
                    label="Color"
                    checked={formData.printer.includes("color")}
                    onChange={(e) =>
                      handleCheckboxArrayChange("printer", "color", e.target.checked)
                    }
                  />
                </div>

                <label className="block text-sm font-medium mb-3">
                  Application
                </label>
                <div className="space-y-2 ml-4">
                  <Checkbox
                    label="Employee Service System"
                    checked={formData.application.includes("ess")}
                    onChange={(e) =>
                      handleCheckboxArrayChange(
                        "application",
                        "ess",
                        e.target.checked
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
                        e.target.checked
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
                    placeholder="Enter purpose for request"
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({ ...formData, purpose: e.target.value })
                    }
                    minRows={3}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <DateInput
                    label="Required Date"
                    placeholder="Select required date"
                    value={formData.required_date}
                    onChange={(value) =>
                      setFormData({ ...formData, required_date: value })
                    }
                    required
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Remarks"
                    placeholder="Enter remarks (optional)"
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData({ ...formData, remarks: e.target.value })
                    }
                    minRows={3}
                  />
                </Grid.Col>
              </Grid>

              <Divider my="lg" />

              {/* Section 10: Assignment */}
              <h3 className="text-md font-semibold mb-4">Assignment</h3>

              <Grid>
                {/* Requested By - SELALU TAMPIL */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    label="Requested By (End User)"
                    placeholder="Select employee"
                    data={employees}
                    value={formData.requested_by}
                    onChange={(value) =>
                      setFormData({ ...formData, requested_by: value })
                    }
                    searchable
                    required
                  />
                </Grid.Col>

                {/* Approved By Section Manager - NON-OVERHEAD */}
                {!isOverhead && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Select
                      label="Approved By Section Manager"
                      placeholder="Select employee"
                      data={employees}
                      value={formData.approved_section_manager}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          approved_section_manager: value,
                        })
                      }
                      searchable
                    />
                  </Grid.Col>
                )}

                {/* Approved By (CM) - NON-OVERHEAD */}
                {!isOverhead && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Select
                      label="Approved By (CM)"
                      placeholder="Select employee"
                      data={employees}
                      value={formData.approved_cm}
                      onChange={(value) =>
                        setFormData({ ...formData, approved_cm: value })
                      }
                      searchable
                    />
                  </Grid.Col>
                )}

                {/* Concurred By (PMO) - NON-OVERHEAD */}
                {!isOverhead && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Select
                      label="Concurred By (PMO)"
                      placeholder="Select employee"
                      data={employees}
                      value={formData.concurred_pmo}
                      onChange={(value) =>
                        setFormData({ ...formData, concurred_pmo: value })
                      }
                      searchable
                    />
                  </Grid.Col>
                )}

                {/* Concurred Yard Manager - NON-OVERHEAD */}
                {!isOverhead && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Select
                      label="Concurred Yard Manager"
                      placeholder="Select employee"
                      data={employees}
                      value={formData.concurred_yard_manager}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          concurred_yard_manager: value,
                        })
                      }
                      searchable
                    />
                  </Grid.Col>
                )}

                {/* Concurred By - OVERHEAD ONLY */}
                {isOverhead && (
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Select
                      label="Concurred By"
                      placeholder="Select employee"
                      data={employees}
                      value={formData.concurred_by}
                      onChange={(value) =>
                        setFormData({ ...formData, concurred_by: value })
                      }
                      searchable
                    />
                  </Grid.Col>
                )}

                {/* Acknowledged By HR - SELALU TAMPIL */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    label="Acknowledged By HR"
                    placeholder="Select employee"
                    data={employees}
                    value={formData.acknowledged_by}
                    onChange={(value) =>
                      setFormData({ ...formData, acknowledged_by: value })
                    }
                    searchable
                  />
                </Grid.Col>

                {/* Approved By (President Director) - SELALU TAMPIL */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    label="Approved By (President Director)"
                    placeholder="Select employee"
                    data={employees}
                    value={formData.approved_by}
                    onChange={(value) =>
                      setFormData({ ...formData, approved_by: value })
                    }
                    searchable
                  />
                </Grid.Col>
              </Grid>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="default" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={handleSubmit}
                  loading={saving}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}