import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useSwal from "@/hooks/useSwal";
import {
  FileInput,
  Paper,
  Text,
  Group,
  Loader,
  Button,
  List,
} from "@mantine/core";
import { IconFileSpreadsheet, IconUpload, IconX } from "@tabler/icons-react";
import axios from "axios";
import { useState } from "react";
import { employeeOnly } from "@/data/sidebar/employee";
import { ActionIcon } from "@mantine/core";
import { useRouter } from "next/navigation";

IssDocuments.title = "Upload Employee Documents";

export default function IssDocuments() {
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();
  const router = useRouter();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===============================
  // HANDLE FILE SELECTION (ONLY STORE)
  // ===============================
  const handleSelectFiles = (selectedFiles) => {
    if (!selectedFiles) return;

    const fileArray = Array.isArray(selectedFiles)
      ? selectedFiles
      : [selectedFiles];

    setFiles((prev) => {
      const merged = [...prev, ...fileArray];

      const unique = merged.filter(
        (file, index, self) =>
          index === self.findIndex((f) => f.name === file.name),
      );

      return unique;
    });
  };

  // ===============================
  // HANDLE REMOVE FILE
  // ===============================
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ===============================
  // HANDLE UPLOAD (BUTTON)
  // ===============================
  const uploadFiles = async () => {
    if (files.length === 0) {
      showAlert("Warning", "warning", "No files selected");
      return;
    }

    // validate excel only
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    const invalid = files.find((file) => !allowedTypes.includes(file.type));

    if (invalid) {
      showAlert(
        "Invalid File",
        "error",
        "Only Excel files (.xls, .xlsx) are allowed",
      );
      return;
    }

    // ===============================
    // CONFIRM DIALOG
    // ===============================
    const confirm = await showAlert(
      "Are You Sure?",
      "question",
      `You are about to upload ${files.length} file(s). Continue?`,
      true,
      null,
      "Upload",
      "Cancel",
    );

    if (!confirm?.isConfirmed) return;

    try {
      setLoading(true);

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        await axios.post(`${API_URL}/api/iss_documents/upload`, formData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // ===============================
      // SUCCESS ALERT
      // ===============================
      await showAlert(
        "Success",
        "success",
        `${files.length} file(s) uploaded successfully`,
        false,
        1500,
      );

      setFiles([]); // clear after upload
    } catch (error) {
      const data_error = error.response?.data || {
        message: "Upload Failed",
        error: "Something went wrong",
      };

      showAlert(data_error.message, "error", data_error.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout sidebarList={employeeOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-4 py-2 bg-gray-200 font-semibold">
              Upload Employee Documents (Excel)
            </div>

            {/* CONTENT */}
            <div className="px-4 py-4">
              {/* FILE INPUT */}
              <FileInput
                leftSection={<IconFileSpreadsheet />}
                label="Attach Excel Files"
                placeholder="Select Excel files (.xls / .xlsx)"
                accept=".xls,.xlsx"
                multiple
                value={files}
                onChange={handleSelectFiles}
                leftSectionPointerEvents="none"
                disabled={loading}
              />

              {/* FILE PREVIEW */}
              {files.length > 0 && (
                <>
                  <Text mt="md" fw={500}>
                    Selected Files
                  </Text>

                  <Paper
                    withBorder
                    radius="md"
                    mt="xs"
                    p="sm"
                    style={{ backgroundColor: "#f9fafb" }}
                  >
                    {files.map((file, idx) => (
                      <Group
                        key={idx}
                        justify="space-between"
                        mb="xs"
                        p="xs"
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          backgroundColor: "white",
                        }}
                      >
                        {/* LEFT SIDE */}
                        <Group gap="sm">
                          <IconFileSpreadsheet size={18} color="#16a34a" />
                          <Text size="sm">{file.name}</Text>
                        </Group>

                        {/* RIGHT SIDE */}
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            {(file.size / 1024).toFixed(1)} KB
                          </Text>

                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => removeFile(idx)}
                          >
                            <IconX size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    ))}
                  </Paper>
                </>
              )}

              {/* UPLOAD BUTTON */}
              <Group mt="lg">
                <Button
                  leftSection={<IconUpload size={16} />}
                  onClick={uploadFiles}
                  loading={loading}
                >
                  Upload Files
                </Button>
              </Group>

              {loading && (
                <Group mt="md">
                  <Loader size="sm" />
                  <Text size="sm">Uploading files...</Text>
                </Group>
              )}
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
