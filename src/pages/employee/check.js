import AuthLayout from "@/components/layout/authLayout";
import { employeeOnly } from "@/data/sidebar/employee";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import { Button, Paper, MultiSelect, Badge, Table } from "@mantine/core";
import {
  IconSearch,
  IconCircleCheck,
  IconToggleRight,
} from "@tabler/icons-react";
import axios from "axios";
import React, { useState } from "react";
import useEncrypt from "@/hooks/useEncrypt";

export default function CheckEmployee() {
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();
  const { encrypt } = useEncrypt();

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // simpan label item terpilih
  const [dropdownData, setDropdownData] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearchInput = async (query) => {
    if (!query || query.trim().length < 1) {
      setDropdownData([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_URL}/api/employee/check?keyword=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      const options = Array.isArray(data)
        ? data.map((item) => ({
            value: String(item.id),
            label: `${item.badge_number} - ${item.full_name}`,
          }))
        : [];
      setDropdownData(options);
    } catch (err) {
      setDropdownData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (values) => {
    setSelectedEmployees(values);
    // simpan label dari item yang dipilih supaya tidak hilang saat dropdown berubah
    const merged = [...dropdownData, ...selectedItems];
    const unique = Array.from(new Map(merged.map((o) => [o.value, o])).values());
    const selected = unique.filter((o) => values.includes(o.value));
    setSelectedItems(selected);
  };

  const handleSearch = async () => {
    if (selectedEmployees.length === 0) return;
    try {
      setSearching(true);
      setSearched(true);
      const { data } = await axios.get(
        `${API_URL}/api/employee/check?ids=${encodeURIComponent(selectedEmployees.join(","))}`,
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleEnable = async (id, fullName) => {
    const confirm = await showAlert(
      "Enable Employee?",
      "question",
      `Are you sure you want to re-activate ${fullName}?`,
      true,
      null,
      "Yes, Enable",
      "Cancel",
    );
    if (!confirm?.isConfirmed) return;

    try {
      await axios.patch(
        `${API_URL}/api/employee/enable/${encrypt(String(id))}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      setResults((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status_active: 1 } : item,
        ),
      );
      await showAlert("Success", "success", "Employee re-activated successfully", false, 1500);
    } catch (err) {
      showAlert("Error", "error", err?.response?.data?.message || "Failed to enable employee");
    }
  };

  const hasActionPermission = user?.permissions?.some((p) => Number(p) === 6);

  // gabungkan dropdown + selected items supaya label tetap tampil
  const multiSelectData = Array.from(
    new Map(
      [...dropdownData, ...selectedItems].map((o) => [o.value, o])
    ).values()
  );

  return (
    <AuthLayout sidebarList={employeeOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconCircleCheck size={20} />
              <h2 className="text-lg font-semibold">Check Employee</h2>
            </div>
            <div className="p-4 flex items-end gap-3">
              <MultiSelect
                className="flex-1"
                placeholder="Search employee by name or badge..."
                data={multiSelectData}
                value={selectedEmployees}
                onChange={handleChange}
                onSearchChange={handleSearchInput}
                searchable
                clearable
                nothingFoundMessage="No inactive employee found"
              />
              <Button
                size="sm"
                leftSection={<IconSearch size={16} />}
                loading={searching}
                onClick={handleSearch}
                disabled={selectedEmployees.length === 0}
              >
                Search
              </Button>
            </div>
          </Paper>

          {searched && (
            <Paper radius="sm" mt="md" withBorder className="overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center gap-2">
                <IconCircleCheck size={20} />
                <h2 className="text-lg font-semibold">
                  Result{" "}
                  <span className="text-sm font-normal text-gray-500">
                    ({results.length} found)
                  </span>
                </h2>
              </div>
              <div className="p-4 overflow-x-auto">
                {results.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    No inactive employee found
                  </div>
                ) : (
                  <Table withTableBorder withColumnBorders striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Badge Number</Table.Th>
                        <Table.Th>Full Name</Table.Th>
                        <Table.Th>Gender</Table.Th>
                        <Table.Th>Position</Table.Th>
                        <Table.Th>Department</Table.Th>
                        <Table.Th>Project</Table.Th>
                        <Table.Th>Company</Table.Th>
                        <Table.Th>Status</Table.Th>
                        {hasActionPermission && <Table.Th>Actions</Table.Th>}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {results.map((item) => (
                        <Table.Tr key={item.id}>
                          <Table.Td>{item.badge_number}</Table.Td>
                          <Table.Td>{item.full_name}</Table.Td>
                          <Table.Td>{item.gender_text}</Table.Td>
                          <Table.Td>{item.position_name}</Table.Td>
                          <Table.Td>{item.departement_name}</Table.Td>
                          <Table.Td>{item.project_name}</Table.Td>
                          <Table.Td>{item.company_name}</Table.Td>
                          <Table.Td>
                            {item.status_active === 1 ? (
                              <Badge color="green" variant="filled" size="sm">Active</Badge>
                            ) : (
                              <Badge color="red" variant="filled" size="sm">Inactive</Badge>
                            )}
                          </Table.Td>
                          {hasActionPermission && (
                            <Table.Td>
                              {item.status_active === 1 ? (
                                <Button size="xs" color="gray" disabled leftSection={<IconToggleRight size={14} />}>
                                  Enabled
                                </Button>
                              ) : (
                                <Button size="xs" color="blue" leftSection={<IconToggleRight size={14} />} onClick={() => handleEnable(item.id, item.full_name)}>
                                  Enable
                                </Button>
                              )}
                            </Table.Td>
                          )}
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </div>
            </Paper>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}