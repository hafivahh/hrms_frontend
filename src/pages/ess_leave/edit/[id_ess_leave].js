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
  Text,
  Loader,
  Center,
  FileInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ManagerSelect from "@/components/ManagerSelect";

dayjs.extend(isSameOrBefore); //

export default function ESSLeaveEdit() {
  const router = useRouter();
  const { id_ess_leave } = router.query;
  const { user } = useUser();
  const API = useApi();
  const { showAlert } = useSwal();

  // Form State
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [partialDays, setPartialDays] = useState([]);
  const [details, setDetails] = useState([]);
  const [supervisorId, setSupervisorId] = useState(null);
  const [supervisorName, setSupervisorName] = useState("");
  const [supervisorQuery] = useState("");
  const [remarks, setRemarks] = useState(""); // State untuk Leave Remarks
  const [file, setFile] = useState(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // ==========================================
  // 1. FETCH DATA EXISTING & MASTER DATA
  // ==========================================
  useEffect(() => {
    if (!id_ess_leave || !user.token) return;

    const initData = async () => {
      try {
        setFetching(true);

        const [resType, resPartial, resExisting] = await Promise.all([
          axios.get(`${API.API_URL}/api/master/leave`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`${API.API_URL}/api/master/partial_days`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`${API.API_URL}/api/ess_leave/${id_ess_leave}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        // Set Master Data
        setLeaveTypes(
          resType.data.map((i) => ({
            value: i.id.toString(),
            label: i.type_name,
          })),
        );
        setPartialDays(
          resPartial.data.map((i) => ({
            value: i.id.toString(),
            label: i.partial_days || i.name,
          })),
        );

        // Set Existing Data ke State
        const data = resExisting.data;

        // PENTING: Mengambil leave_remarks dari data existing
        setRemarks(data.leave_remarks || "");

        if (data.details && data.details.length > 0) {
          const firstDate = dayjs(data.details[0].leave_in).toDate();
          const lastDate = dayjs(
            data.details[data.details.length - 1].leave_out,
          ).toDate();
          setStartDate(firstDate);
          setEndDate(lastDate);

          const mappedDetails = data.details.map((d) => ({
            date: dayjs(d.leave_in).format("YYYY-MM-DD"),
            dateDisplay: dayjs(d.leave_in).format("DD MMM YYYY"),
            dayName: dayjs(d.leave_in).format("dddd"),
            id_leave_type: d.id_leave_type,
            id_partial_days: d.id_partial_days,
          }));
          setDetails(mappedDetails);
        }

        if (data.supervisor) {
          setSupervisorId(data.supervisor.id_user);
          setSupervisorName(
            `${data.supervisor.badge_number} - ${data.supervisor.full_name}`,
          );
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        showAlert("Error", "error", "Failed to load leave data");
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [id_ess_leave, user.token]);

  // ==========================================
  // 2. GENERATE DATE RANGE (Logic Maintain Data)
  // ==========================================
  useEffect(() => {
    if (fetching || !startDate || !endDate) return;
    const temp = [];
    let current = dayjs(startDate);
    while (current.isSameOrBefore(dayjs(endDate), "day")) {
      const dateStr = current.format("YYYY-MM-DD");
      const existing = details.find((d) => d.date === dateStr);
      temp.push(
        existing || {
          date: dateStr,
          dateDisplay: current.format("DD MMM YYYY"),
          dayName: current.format("dddd"),
          id_leave_type: null,
          id_partial_days: null,
        },
      );
      current = current.add(1, "day");
    }
    setDetails(temp);
  }, [startDate, endDate]);

  // ==========================================
  // 3. SUPERVISOR SEARCH
  // ==========================================
  useEffect(() => {
    if (!supervisorQuery || supervisorQuery.includes(" - ")) return;
    const timeout = setTimeout(() => {
      axios
        .get(`${API.API_URL}/api/ess_leave/search`, {
          params: { search: supervisorQuery },
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => {
          setSupervisorOptions(
            res.data.map((i) => ({
              id_user: i.id_user,
              label: `${i.badge_number} - ${i.full_name}`,
            })),
          );
        });
    }, 300);
    return () => clearTimeout(timeout);
  }, [supervisorQuery]);

  // ==========================================
  // 4. FUNGSI UPDATE
  // ==========================================
  const onUpdate = async () => {
    if (!supervisorId)
      return showAlert("Warning", "warning", "Please select supervisor");
    const confirm = await showAlert(
      "Update & Submit?",
      "question",
      "This will update your data and submit for approval.",
      true,
    );
    if (!confirm) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("leave_in", dayjs(startDate).format("YYYY-MM-DD"));
    formData.append("leave_out", dayjs(endDate).format("YYYY-MM-DD"));
    formData.append("supervisor_id", supervisorId);
    formData.append("leave_remarks", remarks); // Mengirim remarks terbaru
    formData.append("details", JSON.stringify(details));

    // Kirim file jika ada perubahan attachment
    if (file) formData.append("file", file);

    try {
      await axios.put(
        `${API.API_URL}/api/ess_leave/update/${id_ess_leave}`,
        formData,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      await showAlert(
        "Success",
        "success",
        "Leave request updated and submitted for approval!",
        false,
        1500,
      );
      router.push("/ess_leave/list");
    } catch (err) {
      showAlert(
        "Error",
        "error",
        err.response?.data?.message || "Failed to update",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );

  return (
    <AuthLayout sidebarList={ess}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER SECTION */}
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconArrowLeft
                  size={18}
                  onClick={() => router.back()}
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                />
                <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-800">
                  Edit Leave Request
                </h2>
              </div>
            </div>

            {/* CONTENT SECTION */}
            <div className="p-6">
              {/* Date Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <DateInput
                  label="Start Date"
                  placeholder="Pick date"
                  value={startDate}
                  onChange={setStartDate}
                  required
                />
                <DateInput
                  label="End Date"
                  placeholder="Pick date"
                  value={endDate}
                  onChange={setEndDate}
                  minDate={startDate}
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
              {/* Details List Section */}
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
                        placeholder="Leave Type"
                        data={leaveTypes}
                        value={item.id_leave_type?.toString()}
                        onChange={(val) => {
                          const copy = [...details];
                          copy[idx].id_leave_type = Number(val);
                          setDetails(copy);
                        }}
                        required
                      />

                      <Select
                        placeholder="Partial Day"
                        data={partialDays}
                        value={item.id_partial_days?.toString() || null}
                        onChange={(val) => {
                          const copy = [...details];
                          copy[idx].id_partial_days = val ? Number(val) : null;
                          setDetails(copy);
                        }}
                        clearable
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Information Section */}
              <div className="grid grid-cols-1 gap-6 border-t pt-6">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Supervisor (Approver) <span className="text-red-500">*</span>
                </label>

                <ManagerSelect
                  value={supervisorId}
                  onChange={(val) => setSupervisorId(val)}
                  onSelect={(selected) =>
                    setSupervisorName(selected?.label || "")
                  }
                />

                {supervisorId && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex flex-col">
                    <Text size="xs" c="green" fw={600}>
                      ✓ Supervisor Selected
                    </Text>
                    <Text size="xs" c="dimmed">
                      {supervisorName}
                    </Text>
                  </div>
                )}

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
                  placeholder="Provide a reason for your leave..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  minRows={3}
                />
              </div>

              {/* Action Button */}
              <div className="flex justify-end mt-10">
                <Button
                 size="xs"
                  loading={loading}
                  onClick={onUpdate}
                  disabled={details.some((d) => !d.id_leave_type)}
                  className="shadow-sm"
                >
                  Update Request
                </Button>
              </div>
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
