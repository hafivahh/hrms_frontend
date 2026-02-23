import AuthLayout from "@/components/layout/authLayout";
import { ess } from "@/data/sidebar/ess";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useSwal from "@/hooks/useSwal";
import {
  Button,
  Paper,
  Select,
  Textarea,
  FileInput,
  Text,
  Autocomplete,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

dayjs.extend(isSameOrBefore);

export default function ESSLeaveCreate() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const { showAlert } = useSwal();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [partialDays, setPartialDays] = useState([]);
  const [details, setDetails] = useState([]);

  const [supervisorQuery, setSupervisorQuery] = useState("");
  const [supervisorOptions, setSupervisorOptions] = useState([]);
  const [supervisorId, setSupervisorId] = useState(null);

  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ======================
  // FETCH MASTER LEAVE
  // ======================
  useEffect(() => {
    axios
      .get(API.API_URL + "/api/master/leave", {
        headers: { Authorization: "Bearer " + user.token },
      })
      .then((res) =>
        setLeaveTypes(
          res.data.map((i) => ({
            value: i.id.toString(),
            label: i.type_name,
          }))
        )
      )
      .catch((err) => console.error(err.response?.data || err.message));
  }, []);

  // ======================
  // FETCH PARTIAL DAYS
  // ======================
  useEffect(() => {
    axios
      .get(API.API_URL + "/api/master/partial_days", {
        headers: { Authorization: "Bearer " + user.token },
      })
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setPartialDays(
            res.data.map((i) => ({
              value: i.id?.toString() || "",
              label: i.partial_days || i.name || "Unknown",
            }))
          );
        }
      })
      .catch((err) => {
        console.error(
          "Error fetching partial days:",
          err.response?.data || err.message
        );
        setPartialDays([]);
      });
  }, []);

  // ======================
  // GENERATE DATE RANGE
  // ======================
  useEffect(() => {
    if (!startDate || !endDate) {
      setDetails([]);
      return;
    }

    if (dayjs(endDate).isBefore(dayjs(startDate))) {
      alert("End date tidak boleh lebih awal dari start date!");
      setEndDate(null);
      setDetails([]);
      return;
    }

    const temp = [];
    let current = dayjs(startDate);

    while (current.isSameOrBefore(dayjs(endDate), "day")) {
      temp.push({
        date: current.format("YYYY-MM-DD"),
        dateDisplay: current.format("DD MMM YYYY"),
        dayName: current.format("dddd"),
        id_leave_type: null,
        id_partial_days: null,
      });
      current = current.add(1, "day");
    }

    setDetails(temp);
  }, [startDate, endDate]);

  // ======================
  // FETCH SUPERVISOR OPTIONS (search by badge/full_name)
  // ======================
  useEffect(() => {
    if (!supervisorQuery) {
      setSupervisorOptions([]);
      return;
    }

    const timeout = setTimeout(() => {
      axios
        .get(`${API.API_URL}/api/employee`, {
          headers: { Authorization: "Bearer " + user.token },
          params: { search: supervisorQuery },
        })
        .then((res) => {
          const options = res.data.map((i) => ({
            badge_number: i.badge_number,
            label: `${i.badge_number} - ${i.full_name}`,
          }));
          setSupervisorOptions(options);
        })
        .catch((err) => console.error(err.response?.data || err.message));
    }, 300);

    return () => clearTimeout(timeout);
  }, [supervisorQuery]);

  // ======================
  // SUBMIT
  // ======================
  const onSubmit = async () => {
    // console.log("=== SUBMIT DEBUG ===");
    // console.log("Supervisor Query:", supervisorQuery);
    // console.log("Supervisor ID:", supervisorId);
    // console.log("Details:", details);

    // Validasi supervisor
    if (!supervisorId) {
      await showAlert(
        "Supervisor Required",
        "question",
        "Please select a supervisor from the dropdown list!\n\nYou must click on one of the suggested options.",
        false
      );
      return;
    }

    // Validasi leave type
    const missingLeaveType = details.find((d) => !d.id_leave_type);
    if (missingLeaveType) {
      await showAlert(
        "Leave Type Required",
        "question",
        `Please select leave type for ${missingLeaveType.dateDisplay}`,
        false
      );
      return;
    }

    // Validasi attachment
    if (!file) {
      await showAlert(
        "Attachment Required",
        "question",
        "Please upload an attachment before submitting the leave request.",
        false
      );
      return;
    }

    // Konfirmasi submit
    const confirm = await showAlert(
      "Are you sure?",
      "question",
      `Do you want to submit this leave request?\n\nTotal Days: ${details.length}`,
      true
    );

    if (!confirm) {
      return; // User cancel
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("leave_in", dayjs(startDate).format("YYYY-MM-DD"));
    formData.append("leave_out", dayjs(endDate).format("YYYY-MM-DD"));
    formData.append("supervisor_id", supervisorId);
    formData.append("leave_remarks", remarks || "");
    formData.append("details", JSON.stringify(details));

    // console.log("=== SENDING TO BACKEND ===");
    // console.log("supervisor_id:", supervisorId);
    // console.log("total_days:", details.length);

    if (file) formData.append("file", file);

    try {
      const response = await axios.post(
        `${API.API_URL}/api/ess_leave/create`,
        formData,
        {
          headers: {
            Authorization: "Bearer " + user.token,
            // "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("=== SUCCESS ===", response.data);

      const totalDays = response.data.total_days || details.length;
      await showAlert(
        "Success",
        "success",
        `Leave request submitted successfully!\n\nTotal Days: ${totalDays}\nSupervisor: ${supervisorQuery}`,
        false,
        1500
      );

      router.push("/ess_leave/list");
    } catch (err) {
      console.error("=== ERROR ===", err.response?.data || err.message);

      const data_error = err.response?.data || {
        message: "Error",
        error: "Failed to submit leave request. Please try again.",
      };

      await showAlert(
        data_error.message || "Error",
        "error",
        data_error.error || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    !!supervisorId &&
    details.length > 0 &&
    details.every((d) => Number.isInteger(d.id_leave_type)) &&
    !!file &&
    !loading;

  return (
    <AuthLayout sidebarList={ess}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="md" withBorder shadow="xs">
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconArrowLeft
                  size={18}
                  onClick={() => router.back()}
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                />
                <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-800">
                  Create Leave Request
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <DateInput
                  label="Start Date"
                  placeholder="Select start date"
                  value={startDate}
                  onChange={setStartDate}
                  required
                />
                <DateInput
                  label="End Date"
                  placeholder="Select end date"
                  value={endDate}
                  onChange={setEndDate}
                  minDate={startDate || undefined}
                  required
                />
              </div>

              {/* INFO JUMLAH HARI */}
              {details.length > 0 && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <Text
                    size="sm"
                    c="blue"
                    fw={600}
                    className="flex items-center gap-2"
                  >
                    Total Leave Days: {details.length}{" "}
                    {details.length === 1 ? "day" : "days"}
                  </Text>
                </div>
              )}

              {/* FORM DINAMIS PER HARI */}
              {details.length > 0 && (
                <div className="space-y-4 mb-8">
                  <Text
                    fw={600}
                    size="md"
                    className="border-b pb-2 text-gray-700"
                  >
                    Detail Per Day
                  </Text>

                  <div className="space-y-3">
                    {details.map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-[1.5fr_2fr_2fr] gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg items-center"
                      >
                        <div>
                          <Text fw={600} size="sm">
                            {item.dateDisplay}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {item.dayName}
                          </Text>
                        </div>

                        <Select
                          placeholder="Select leave type"
                          data={leaveTypes}
                          value={item.id_leave_type?.toString()}
                          onChange={(val) => {
                            const copy = [...details];
                            copy[idx].id_leave_type = Number(val);
                            setDetails(copy);
                          }}
                          required
                          searchable
                        />

                        <Select
                          placeholder="Partial days (Optional)"
                          data={partialDays.length > 0 ? partialDays : []}
                          value={item.id_partial_days?.toString() || null}
                          onChange={(val) => {
                            const copy = [...details];
                            copy[idx].id_partial_days = val
                              ? Number(val)
                              : null;
                            setDetails(copy);
                          }}
                          searchable
                          clearable
                          disabled={partialDays.length === 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ADDITIONAL INFORMATION SECTION */}
              <div className="space-y-5 border-t pt-6">
                <div>
                  <Autocomplete
                    label="Supervisor (Approver)"
                    placeholder="Type badge number or full name"
                    value={supervisorQuery}
                    data={supervisorOptions.map((o) => o.label)}
                    onChange={(val) => {
                      setSupervisorQuery(val);
                      const selected = supervisorOptions.find(
                        (o) => o.label === val
                      );
                      setSupervisorId(selected ? selected.badge_number : null);
                    }}
                    required
                    limit={10}
                  />

                  {/* Supervisor Status Indicators */}
                  {supervisorId && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex flex-col">
                      <Text size="xs" c="green" fw={600}>
                        ✓ Supervisor Selected
                      </Text>
                      <Text size="xs" c="dimmed">
                        Badge: {supervisorId}
                      </Text>
                    </div>
                  )}
                  {supervisorQuery && !supervisorId && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <Text size="xs" c="orange" fw={500}>
                        ⚠ Please select from the dropdown list
                      </Text>
                    </div>
                  )}
                </div>

                <FileInput
                  label="Attachment"
                  placeholder="Choose file"
                  value={file}
                  onChange={setFile}
                  accept="image/*,.pdf,.doc,.docx"
                  required
                />

                <Textarea
                  label="Leave Remarks"
                  placeholder="Enter your reason for leave"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  minRows={3}
                />
              </div>

              {/* SUBMIT BUTTON */}
              <Button
                mt="2.5rem"
                fullWidth
                size="md"
                leftSection={<IconSend size={18} />}
                onClick={onSubmit}
                disabled={!isFormValid}
                loading={loading}
              >
                Submit Leave Request
              </Button>
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
