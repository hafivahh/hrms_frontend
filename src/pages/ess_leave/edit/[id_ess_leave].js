import AuthLayout from "@/components/layout/authLayout";
import { employee } from "@/data/sidebar/employee";
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
  Loader,
  Center,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

dayjs.extend(isSameOrBefore);

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
  const [supervisorQuery, setSupervisorQuery] = useState("");
  const [supervisorOptions, setSupervisorOptions] = useState([]);
  const [supervisorId, setSupervisorId] = useState(null);
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
          axios.get(`${API.API_URL}/api/master/leave`, { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get(`${API.API_URL}/api/master/partial_days`, { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get(`${API.API_URL}/api/ess_leave/${id_ess_leave}`, { headers: { Authorization: `Bearer ${user.token}` } })
        ]);

        // Set Master Data
        setLeaveTypes(resType.data.map(i => ({ value: i.id.toString(), label: i.type_name })));
        setPartialDays(resPartial.data.map(i => ({ value: i.id.toString(), label: i.partial_days || i.name })));

        // Set Existing Data ke State
        const data = resExisting.data;

        // PENTING: Mengambil leave_remarks dari data existing
        setRemarks(data.leave_remarks || ""); 
        
        if (data.details && data.details.length > 0) {
          const firstDate = dayjs(data.details[0].leave_in).toDate();
          const lastDate = dayjs(data.details[data.details.length - 1].leave_out).toDate();
          setStartDate(firstDate);
          setEndDate(lastDate);

          const mappedDetails = data.details.map(d => ({
            date: dayjs(d.leave_in).format("YYYY-MM-DD"),
            dateDisplay: dayjs(d.leave_in).format("DD MMM YYYY"),
            dayName: dayjs(d.leave_in).format("dddd"),
            id_leave_type: d.id_leave_type,
            id_partial_days: d.id_partial_days,
          }));
          setDetails(mappedDetails);
        }

        if (data.supervisor) {
          const label = `${data.supervisor.badge_number} - ${data.supervisor.full_name}`;
          setSupervisorQuery(label);
          setSupervisorId(data.supervisor.badge_number);
          setSupervisorOptions([{ badge_number: data.supervisor.badge_number, label }]);
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
      const existing = details.find(d => d.date === dateStr);
      temp.push(existing || {
        date: dateStr,
        dateDisplay: current.format("DD MMM YYYY"),
        dayName: current.format("dddd"),
        id_leave_type: null,
        id_partial_days: null,
      });
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
      axios.get(`${API.API_URL}/api/employee`, {
        headers: { Authorization: `Bearer ${user.token}` },
        params: { search: supervisorQuery },
      }).then((res) => {
        setSupervisorOptions(res.data.map(i => ({
          badge_number: i.badge_number,
          label: `${i.badge_number} - ${i.full_name}`,
        })));
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [supervisorQuery]);

  // ==========================================
  // 4. FUNGSI UPDATE
  // ==========================================
  const onUpdate = async () => {
    if (!supervisorId) return showAlert("Warning", "warning", "Please select supervisor");
    const confirm = await showAlert("Update & Submit?", "question", "This will update your data and submit for approval.", true);
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
      await axios.put(`${API.API_URL}/api/ess_leave/update/${id_ess_leave}`, formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      await showAlert("Success", "success", "Leave request updated and submitted for approval!");
      router.push("/ess_leave/list");
    } catch (err) {
      showAlert("Error", "error", err.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Center h="100vh"><Loader size="xl" /></Center>;

  return (
    <AuthLayout sidebarList={employee}>
      <div className="py-6 max-w-4xl mx-auto">
        <Paper withBorder p="md" shadow="sm" radius="md">
          <div className="flex items-center gap-2 mb-6">
            <IconArrowLeft size={22} className="cursor-pointer hover:text-blue-600" onClick={() => router.back()} />
            <Text fw={700} size="xl">Edit Leave Request</Text>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <DateInput label="Start Date" value={startDate} onChange={setStartDate} required />
            <DateInput label="End Date" value={endDate} onChange={setEndDate} minDate={startDate} required />
          </div>

          <div className="space-y-4 mb-8">
            <Text fw={600} size="md" className="border-b pb-2">Detail Per Day</Text>
            {details.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[1.5fr_2fr_2fr] gap-4 p-4 bg-gray-50 border rounded-lg items-center">
                <div>
                  <Text fw={600} size="sm">{item.dateDisplay}</Text>
                  <Text size="xs" c="dimmed">{item.dayName}</Text>
                </div>
                <Select
                  placeholder="Type"
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
                  placeholder="Partial"
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

          <div className="space-y-4">
            <Autocomplete
              label="Supervisor"
              placeholder="Search..."
              value={supervisorQuery}
              data={supervisorOptions.map(o => o.label)}
              onChange={(val) => {
                setSupervisorQuery(val);
                const sel = supervisorOptions.find(o => o.label === val);
                setSupervisorId(sel ? sel.badge_number : null);
              }}
              required
            />

            <FileInput
              label="Attachment"
              placeholder="Upload to change file"
              value={file}
              onChange={setFile}
              accept="image/*,.pdf"
            />

            <Textarea
              label="Leave Remarks"
              placeholder="Reason for leave..."
              value={remarks} // State ini terisi otomatis dari initData
              onChange={(e) => setRemarks(e.target.value)}
              minRows={3}
            />
          </div>

          <Button
            mt="2rem"
            fullWidth
            size="md"
            leftSection={<IconDeviceFloppy size={18} />}
            loading={loading}
            onClick={onUpdate}
            disabled={details.some(d => !d.id_leave_type)}
          >
            Update & Submit
          </Button>
        </Paper>
      </div>
    </AuthLayout>
  );
}