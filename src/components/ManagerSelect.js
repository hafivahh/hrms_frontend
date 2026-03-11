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
  const [initialUserLoaded, setInitialUserLoaded] = useState(false);

  const fetchUserById = useCallback(
    async (userId) => {
      if (!userId) return;

      try {
        const res = await axios.get(`${API_URL}/api/user/list`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const users = res.data || [];

        // Cari user berdasarkan id_user
        const foundUser = users.find((u) => u.id_user === Number(userId));

        if (foundUser) {
          const userData = {
            value: String(foundUser.id_user),
            label: `${foundUser.full_name} - ${foundUser.badge_number}`,
          };

          setSelectedOption(userData);
          setData((prev) => {
            const exists = prev.some((item) => item.value === userData.value);
            return exists ? prev : [userData, ...prev];
          });
          setInitialUserLoaded(true);
        }
      } catch (err) {
        console.error("Failed to fetch user by ID:", err);
      }
    },
    [API_URL, user.token],
  );

  // Load initial user saat component mount dengan value
  useEffect(() => {
    if (value && !initialUserLoaded) {
      fetchUserById(value);
    }
  }, [value, initialUserLoaded, fetchUserById]);

  const fetchUsers = useCallback(
    async (text) => {
      if (!text || text.length < 2) {
        if (!selectedOption) {
          setData([]);
        }
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/user/list`, {
          params: { query: text },
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const users = res.data || [];
        const mappedUsers = users.map((u) => ({
          value: String(u.id_user),
          label: `${u.full_name} - ${u.badge_number}`,
        }));

        setData((prev) => {
          if (
            selectedOption &&
            !mappedUsers.some((u) => u.value === selectedOption.value)
          ) {
            return [selectedOption, ...mappedUsers];
          }
          return mappedUsers;
        });
      } catch (err) {
        console.error(err);
        setData(selectedOption ? [selectedOption] : []);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, user.token, selectedOption],
  );

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(search), 500);
    return () => clearTimeout(timeout);
  }, [search, fetchUsers]);

  const handleChange = (val) => {
    onChange(val ? Number(val) : null);

    const selected = [...data, ...(choose ?? [])].find((u) => u.value === val);

    if (selected) {
      setSelectedOption(selected);
    } else if (!val) {
      setSelectedOption(null);
      setInitialUserLoaded(false);
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
      onChange={handleChange}
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
