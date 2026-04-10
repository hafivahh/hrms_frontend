/* eslint-disable @next/next/no-img-element */
import { TextInput, Button, Badge, Loader, MultiSelect } from "@mantine/core";
import { IconSearch, IconUsers } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import axios from "axios";
import useApi from "@/hooks/useApi";
import { useRouter } from "next/router";
import useEncrypt from "@/hooks/useEncrypt";

// STATUS MAP
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

  // FETCH DATA
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

  // FETCH POSITION DROPDOWN
  const fetchPositions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/career/dropdowns`);
      setPositions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setPositions([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPositions();
  }, []);

  // FILTER
  const filteredData = data.filter((item) => {
    if (item.recruitment_status === 3) return false;

    const matchKeyword =
      keyword.trim() === "" ||
      [item.position, item.departement]
        .join(" ") // gabung jadi satu string
        .toLowerCase()
        .includes(keyword.toLowerCase());

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
      {/* HERO */}
      <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden">
        <video
          src="/images/career.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* SEARCH */}
      <div className="bg-blue-900 py-8 md:py-12 px-4 md:px-10 text-white">
        <h2 className="text-white text-lg md:text-xl font-semibold mb-6">
          Open Jobs
        </h2>

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

      {/* LIST */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12 space-y-6">
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
                className="border rounded-xl p-4 md:p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition"
              >
                {/* LEFT */}
                <div className="w-full">
                  {/* Position | Departement */}
                  <div
                    className="text-lg md:text-xl font-semibold text-blue-600 cursor-pointer hover:underline flex flex-wrap items-center gap-1"
                    onClick={() =>
                      router.push(`/career/detail/${encrypt(String(item.id))}`)
                    }
                  >
                    <span>{item.position || "-"}</span>
                    <span className="text-gray-400 hidden sm:inline">|</span>
                    <span className="text-gray-500 font-normal">
                      {item.departement || "-"}
                    </span>
                  </div>

                  {/* Qty */}
                  <div className="text-gray-500 mt-1 text-sm flex items-center gap-1">
                    <IconUsers size={14} />
                    Needed: {item.qty ?? 0} {item.qty > 1 ? "people" : "person"}
                  </div>

                  {/* Status */}
                  <div className="mt-2 md:mt-3">
                    <Badge color={status.color} radius="sm">
                      {status.label}
                    </Badge>
                  </div>
                </div>

                {/* RIGHT BUTTON */}
                <Button
                  className="w-full md:w-auto md:min-w-[120px] md:px-6"
                  onClick={() =>
                    router.push(`/career/detail/${encrypt(String(item.id))}`)
                  }
                >
                  Apply
                </Button>
              </div>
            );
          })}

        {/* SHOW MORE */}
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
