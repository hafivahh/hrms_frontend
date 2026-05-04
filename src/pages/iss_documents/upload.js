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

      attachmentFiles.forEach((file) => {
        formData.append("attachments", file);
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

      const successCount = data.success?.length || 0;
      const errorCount = data.errors?.length || 0;

      if (errorCount > 0 && successCount === 0) {
        // ✅ semua gagal — tampil error
        await showAlert(
          "Import Failed",
          "error",
          `${data.errors.map((e) => `Row ${e.row}: ${e.error}`).join("\n")}`,
        );
      } else if (errorCount > 0 && successCount > 0) {
        // ✅ sebagian sukses
        await showAlert(
          "Partial Success",
          "warning",
          `${successCount} row(s) imported successfully.\n\nFailed:\n${data.errors.map((e) => `Row ${e.row}: ${e.error}`).join("\n")}`,
          false,
          undefined,
        );
      } else {
        // ✅ semua sukses
        await showAlert(
          "Success",
          "success",
          `${successCount} row(s) imported successfully`,
          false,
          1500,
        );
      }

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
            {/* CONTENT */}
            <div className="p-4 sm:p-8">
              <div className="flex flex-col gap-6">
                {/* Row 1 — Download Template */}
                <div className="flex flex-col sm:flex-row sm:items-center border-b pb-5">
                  <div className="w-full sm:w-[250px] mb-2 sm:mb-0">
                    <Text size="sm" fw={500}>
                      Template File Attachment
                    </Text>
                  </div>
                  <div className="flex-1">
                    <Button
                      color="green"
                      leftSection={<IconDownload size={16} />}
                      onClick={handleDownloadTemplate}
                      size="xs"
                      className="w-full sm:w-auto" // Full di mobile, auto di desktop
                    >
                      Download Template File Attachment
                    </Button>
                  </div>
                </div>

                {/* Row 2 — Upload Template */}
                <div className="flex flex-col sm:flex-row sm:items-center border-b pb-5">
                  <div className="w-full sm:w-[250px] mb-2 sm:mb-0">
                    <Text size="sm" fw={500}>
                      Upload Template
                    </Text>
                  </div>
                  <div className="flex-1">
                    <FileInput
                      placeholder="Choose file"
                      accept=".xls,.xlsx"
                      value={templateFile}
                      onChange={setTemplateFile}
                      disabled={loading}
                      className="w-full sm:max-w-[400px]" // Biar gak melar kepanjangan di desktop
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
                  </div>
                </div>

                {/* Row 3 — Upload Attachment */}
                <div className="flex flex-col sm:flex-row sm:items-start border-b pb-5">
                  <div className="w-full sm:w-[250px] mt-2 mb-2 sm:mb-0">
                    <Text size="sm" fw={500}>
                      Upload Attachment
                    </Text>
                  </div>
                  <div className="flex-1">
                    <FileInput
                      placeholder="Choose files"
                      multiple
                      value={attachmentFiles}
                      onChange={handleAttachmentChange}
                      disabled={loading}
                      className="w-full sm:max-w-[400px]"
                    />

                    {/* Preview list file */}
                    {attachmentFiles.length > 0 && (
                      <div className="mt-3 space-y-2 sm:max-w-[400px]">
                        {attachmentFiles.map((file, idx) => (
                          <Group
                            key={idx}
                            gap="xs"
                            justify="space-between"
                            wrap="nowrap"
                            className="border border-gray-200 rounded-md p-2"
                          >
                            <Text size="xs" truncate className="flex-1">
                              {file.name}
                            </Text>
                            <Group gap={4} wrap="nowrap">
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
                  </div>
                </div>
              </div>
              {/* SUBMIT BUTTON - Diposisikan ke kanan di desktop */}
              <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-4">
                {loading && (
                  <Group gap="md">
                    <Loader size="sm" />
                    <Text size="sm">Uploading...</Text>
                  </Group>
                )}
                <Button
                  size="xs"
                  onClick={handleSubmit}
                  loading={loading}
                  className="w-full sm:w-[150px]" // Di desktop lebarnya pas, di HP lebar penuh
                >
                  Submit
                </Button>
              </div>
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
