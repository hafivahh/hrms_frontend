import { useCallback, useEffect, useState } from "react";
import { Select, Loader } from "@mantine/core";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";

export default function ManagerSelect(props) {
  const { value, onChange, choose, isDisabled, onSelect, errorMsg } = props;
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const fetchUsers = useCallback(async (text) => {
    if (!text || text.length < 2) {
      setData([]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/user/list`, {
        params: { query: text },
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const users = res.data || [];
      setData(
        users.map((u) => ({
          value: String(u.id_user),
          label: `${u.full_name} - ${u.badge_number}`,
        }))
      );
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, user.token]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(search), 500);
    return () => clearTimeout(timeout);
  }, [search, fetchUsers]);

const handleChange = (val) => {
  onChange(val ? Number(val) : null)

    const selected = [...data, ...(choose ?? [])].find(
      (u) => u.value === val
    );

    if (selected) {
      setSelectedOption(selected);
    }

    if (onSelect && selected) {
      onSelect(selected);
    }
  };

  return (
    <Select
      searchable
      clearable
      placeholder="Type to search..."
      value={value ? String(value) : null}
      onChange={(val) => onChange(val ? Number(val) : null)} // 🔥 FIX
      data={data}
      searchValue={search}
      onSearchChange={setSearch}
      nothingFoundMessage={loading ? <Loader size="sm" /> : "No user found"}
      rightSection={loading ? <Loader size="sm" /> : null}
      disabled={isDisabled}
      error={errorMsg}
    />
  );
}
