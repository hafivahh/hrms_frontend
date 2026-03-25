import AuthLayout from "@/components/layout/authLayout";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useSwal from "@/hooks/useSwal";
import {
  FileInput,
  Paper,
  Group,
  Loader,
  Button,
  Text,
  Table,
} from "@mantine/core";
import {
  IconFileSpreadsheet,
  IconUpload,
  IconDownload,
  IconX,
} from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import axios from "axios";
import { useState } from "react";
import { DocumentOnly } from "@/data/sidebar/employee";

export default function IssDocumentsUpload() {
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const [templateFile, setTemplateFile] = useState(null);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDownloadTemplate = () => {
    window.open("/template/template_attachment.xlsx", "_blank");
  };

  const handleAttachmentChange = (selectedFiles) => {
    if (!selectedFiles) return;
    const fileArray = Array.isArray(selectedFiles)
      ? selectedFiles
      : [selectedFiles];
    setAttachmentFiles((prev) => {
      const merged = [...prev, ...fileArray];
      return merged.filter(
        (file, index, self) =>
          index === self.findIndex((f) => f.name === file.name),
      );
    });
  };

  const removeAttachment = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!templateFile) {
      showAlert("Warning", "warning", "Please select a Template file");
      return;
    }

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowedTypes.includes(templateFile.type)) {
      showAlert(
        "Invalid File",
        "error",
        "Template must be an Excel file (.xls / .xlsx)",
      );
      return;
    }

    const confirm = await showAlert(
      "Are You Sure?",
      "question",
      "You are about to import documents. Continue?",
      true,
      null,
      "Submit",
      "Cancel",
    );
    if (!confirm?.isConfirmed) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("template", templateFile);

      // ⬅️ append semua attachment
      attachmentFiles.forEach((file) => {
        formData.append("attachments", file); // key "attachments" (plural)
      });

      const { data } = await axios.post(
        `${API_URL}/api/iss_documents/import`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // ⬅️ tampilkan summary hasil import
      const msg = `${data.message}${
        data.errors.length > 0
          ? `\n\nErrors:\n${data.errors.map((e) => `Row ${e.row}: ${e.error}`).join("\n")}`
          : ""
      }`;

      await showAlert(
        data.errors.length > 0 ? "Partial Success" : "Success",
        data.errors.length > 0 ? "warning" : "success",
        msg,
        false,
        data.errors.length > 0 ? undefined : 1500,
      );

      setTemplateFile(null);
      setAttachmentFiles([]);
    } catch (error) {
      const data_error = error.response?.data || {
        message: "Import Failed",
        error: "Something went wrong",
      };
      showAlert(data_error.message, "error", data_error.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout sidebarList={DocumentOnly}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder>
            {/* HEADER */}
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <IconFileSpreadsheet size={20} />
              <h2 className="text-lg font-semibold">Import File Attachment</h2>
            </div>

            {/* CONTENT */}
            <div className="p-6">
              <Table verticalSpacing="lg">
                <Table.Tbody>
                  {/* Row 1 — Download Template */}
                  <Table.Tr>
                    <Table.Td w={220}>
                      <Text size="sm">Template File Attachment</Text>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        color="green"
                        leftSection={<IconDownload size={16} />}
                        onClick={handleDownloadTemplate}
                        size="xs"
                      >
                        Download Template File Attachment
                      </Button>
                    </Table.Td>
                  </Table.Tr>

                  {/* Row 2 — Upload Template */}
                  <Table.Tr>
                    <Table.Td>
                      <Text size="sm">Upload Template</Text>
                    </Table.Td>
                    <Table.Td>
                      <FileInput
                        placeholder="Choose file"
                        accept=".xls,.xlsx"
                        value={templateFile}
                        onChange={setTemplateFile}
                        disabled={loading}
                        w={350}
                        rightSection={
                          templateFile ? (
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              size="sm"
                              onClick={() => setTemplateFile(null)}
                            >
                              <IconX size={14} />
                            </ActionIcon>
                          ) : null
                        }
                      />
                    </Table.Td>
                  </Table.Tr>

                  {/* Row 3 — Upload Attachment */}
                  {/* Row 3 — Upload Attachment (multi) */}
                  <Table.Tr>
                    <Table.Td>
                      <Text size="sm">Upload Attachment</Text>
                    </Table.Td>
                    <Table.Td>
                      <FileInput
                        placeholder="Choose files"
                        multiple
                        value={attachmentFiles}
                        onChange={handleAttachmentChange}
                        disabled={loading}
                        w={350}
                      />

                      {/* Preview list file */}
                      {attachmentFiles.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {attachmentFiles.map((file, idx) => (
                            <Group
                              key={idx}
                              gap="xs"
                              justify="space-between"
                              style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: 6,
                                padding: "4px 8px",
                              }}
                            >
                              <Text size="xs">{file.name}</Text>
                              <Group gap={4}>
                                <Text size="xs" c="dimmed">
                                  {(file.size / 1024).toFixed(1)} KB
                                </Text>
                                <ActionIcon
                                  color="red"
                                  variant="subtle"
                                  size="xs"
                                  onClick={() => removeAttachment(idx)}
                                >
                                  <IconX size={12} />
                                </ActionIcon>
                              </Group>
                            </Group>
                          ))}
                        </div>
                      )}
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>

              {/* SUBMIT */}
              <Group justify="flex-end" mt="xl">
                {loading && (
                  <Group gap="md">
                    <Loader size="sm" />
                    <Text size="sm">Uploading...</Text>
                  </Group>
                )}
                <Button size="md" onClick={handleSubmit} loading={loading}>
                  Submit
                </Button>
              </Group>
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
