/* eslint-disable @next/next/no-img-element */
import {
  TextInput,
  Button,
  Badge,
  Loader,
  Select,
  MultiSelect,
} from "@mantine/core";
import { IconSearch, IconUsers } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import axios from "axios";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { useRouter } from "next/router";
import useEncrypt from "@/hooks/useEncrypt";

// ── STATUS MAP ─────────────────────────────────────────────────
const recruitmentStatusMap = {
  1: { label: "Open", color: "green" },
  2: { label: "Open", color: "green" },
};

export default function PssRecruitmentList() {
  const { encrypt } = useEncrypt();
  const API = useApi();
  const API_URL = API.API_URL;
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  const [data, setData] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [position, setPosition] = useState([]);

  // ================= FETCH OPEN RECRUITMENT =================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/career/open_recruitment`);
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
      const res = await axios.get(`${API_URL}/api/career/dropdowns`, {});
      setPositions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch positions", err);
      setPositions([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================= CLIENT-SIDE FILTER =================
  // keyword → cocok ke position name
  // position → cocok ke id_position (dari dropdown)
  // ================= CLIENT-SIDE FILTER =================
  const filteredData = data.filter((item) => {
    // Sembunyikan yang closed (status 3)
    if (item.recruitment_status === 3) return false;

    const matchKeyword =
      keyword === "" ||
      item.position?.toLowerCase().includes(keyword.toLowerCase());

    const matchPosition =
      position.length === 0 ||
      position.some(
        (p) =>
          item.position ===
          positions.find((pos) => pos.id.toString() === p)?.position_name,
      );

    return matchKeyword && matchPosition;
  });

  const displayedData = showAll ? filteredData : filteredData.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* ================= HERO SECTION ================= */}
      <div className="relative w-full h-[450px] overflow-hidden">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="/images/career.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-16 left-10 text-white">
          <h1 className="text-4xl font-bold leading-tight">
            <br />
          </h1>
        </div>
      </div>

      {/* ================= SEARCH SECTION ================= */}
      <div className="bg-blue-900 py-12 px-10 text-white">
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
          <MultiSelect
            placeholder="Select Position"
            leftSection={<IconSearch size={16} />}
            data={positions.map((p) => ({
              value: p.id.toString(),
              label: p.position_name,
            }))}
            value={position ?? []}
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
          displayedData.map((item) => {
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
                    onClick={() =>
                      router.push(`/career/detail/${encrypt(String(item.id))}`)
                    }
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
                <Button
                  onClick={() =>
                    router.push(`/career/detail/${encrypt(String(item.id))}`)
                  }
                >
                  Apply
                </Button>
              </div>
            );
          })}
        {!loading && filteredData.length > 3 && (
          <div className="flex justify-center mt-6">
            <Button variant="light" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show Less" : "Show More"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
