import { TextInput, Button, Badge, Loader, Select } from "@mantine/core";
import { IconSearch, IconUsers } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import axios from "axios";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { useRouter } from "next/router";

// ── STATUS MAP ─────────────────────────────────────────────────
const recruitmentStatusMap = {
  1: { label: "Open", color: "green" },
  3: { label: "Closed", color: "red" },
};

export default function PssRecruitmentList() {
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const router = useRouter();

  const [data, setData] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [position, setPosition] = useState(null);

  // ================= FETCH OPEN RECRUITMENT =================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/pss_recruitment/open_recruitment`,
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH POSITIONS (DROPDOWN) =================
  const fetchPositions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pss_recruitment/dropdowns`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setPositions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch positions", err);
      setPositions([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPositions();
  }, []);

  // ================= CLIENT-SIDE FILTER =================
  // keyword → cocok ke position name
  // position → cocok ke id_position (dari dropdown)
  const filteredData = data.filter((item) => {
    const matchKeyword =
      keyword === "" ||
      item.position?.toLowerCase().includes(keyword.toLowerCase());

    const matchPosition =
      !position ||
      item.position ===
        positions.find((p) => p.id.toString() === position)?.position_name;

    return matchKeyword && matchPosition;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* ================= HERO SECTION ================= */}
      <div className="relative w-full h-[450px]">
        <img
          src="/images/recruitment.jpg"
          alt="Recruitment Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-16 left-10 text-white">
          <h1 className="text-4xl font-bold leading-tight">
            <br />
          </h1>
        </div>
      </div>

      {/* ================= SEARCH SECTION ================= */}
      <div className="bg-cyan-500 py-12 px-10 text-white">
        <h2 className="text-white text-xl font-semibold mb-6">Open Jobs</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <TextInput
            placeholder="Search by Keyword"
            leftSection={<IconSearch size={16} />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1"
            radius="md"
            size="md"
          />
          <Select
            placeholder="Select Position"
            leftSection={<IconSearch size={16} />}
            data={positions.map((p) => ({
              value: p.id.toString(),
              label: p.position_name,
            }))}
            value={position}
            onChange={setPosition}
            searchable
            clearable
            className="flex-1"
            radius="md"
            size="md"
          />
        </div>
      </div>

      {/* ================= LIST SECTION ================= */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-6">
        {loading && (
          <div className="flex justify-center">
            <Loader />
          </div>
        )}

        {!loading && filteredData.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            No open positions found
          </div>
        )}

        {!loading &&
          filteredData.map((item) => {
            const status = recruitmentStatusMap[item.recruitment_status] ?? {
              label: "Unknown",
              color: "gray",
            };

            return (
              <div
                key={item.id}
                className="border rounded-xl p-6 flex justify-between items-center shadow-sm hover:shadow-md transition"
              >
                {/* LEFT: Info */}
                <div>
                  {/* Position name */}
                  <div
                    className="text-xl font-semibold text-blue-600 cursor-pointer hover:underline"
                    onClick={() => router.push(`/pss_recruitment/${item.id}`)}
                  >
                    {item.position || "-"}
                  </div>

                  {/* Qty */}
                  <div className="text-gray-500 mt-1 text-sm flex items-center gap-1">
                    <IconUsers size={14} />
                    Needed: {item.qty ?? 0} {item.qty > 1 ? "people" : "person"}
                  </div>

                  {/* Recruitment status badge */}
                  <div className="mt-3">
                    <Badge color={status.color} radius="sm">
                      {status.label}
                    </Badge>
                  </div>
                </div>

                {/* RIGHT: Apply button */}
                <Button variant="outline">Apply</Button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
