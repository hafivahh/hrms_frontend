import {
  Badge,
  Loader,
  Button,
  Divider,
  Modal,
  TextInput,
  Textarea,
  FileInput,
  Group,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconUsers,
  IconBriefcase,
  IconBook,
  IconClock,
} from "@tabler/icons-react";
import useSwal from "@/hooks/useSwal";

import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import axios from "axios";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { useRouter } from "next/router";
import useDecrypt from "@/hooks/useDecrypt";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const recruitmentStatusMap = {
  1: { label: "Open", color: "green" },
  3: { label: "Closed", color: "red" },
};

export default function PssRecruitmentDetail() {
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();
  const router = useRouter();
  const { id } = router.query;
  const { decrypt } = useDecrypt();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileKey, setFileKey] = useState(0);
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      phone: "",
      file: null,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      name: (value) => (!value ? "Name is required" : null),
      phone: (value) => {
        if (!value) return "Phone number is required";
        if (!/^\d+$/.test(value))
          return "Phone number must contain numbers only";
        if (value.length < 8) return "Phone number too short";
        return null;
      },
      file: (value) => (!value ? "CV is required" : null),
    },
  });

  const fetchDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const decryptedId = decrypt(String(id));

      const res = await axios.get(`${API_URL}/api/career/${decryptedId}`);

      setData(res.data);
    } catch (err) {
      console.error("FETCH DETAIL ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (values) => {
    const decryptedId = decrypt(id);
    const file = values.file;

    // cek magic bytes di frontend
    const checkMagicBytes = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = (e) => {
          const arr = new Uint8Array(e.target.result).subarray(0, 8);
          const hex = Array.from(arr)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase();

          if (hex.startsWith("25504446")) resolve("pdf");
          else if (hex.startsWith("89504E47")) resolve("png");
          else if (hex.startsWith("FFD8FF")) resolve("jpg");
          else resolve(null);
        };
        reader.readAsArrayBuffer(file.slice(0, 8));
      });
    };

    const realType = await checkMagicBytes(file);
    if (!realType) {
      await showAlert(
        "Invalid File",
        "error",
        "File content is invalid. Only real PDF, PNG, and JPG files are allowed.",
      );
      return;
    }

    const confirm = await showAlert(
      "Are You Sure?",
      "question",
      `You are about to upload 1 file. Continue?`,
      true,
      null,
      "Upload",
      "Cancel",
    );

    if (!confirm?.isConfirmed) return;

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("file", values.file);
      formData.append("mpr_id", decryptedId);
      formData.append("mpr_no", data.mpr_no);
      if (data.id_project) {
        formData.append("id_project", data.id_project);
      }
      formData.append("email", values.email);
      formData.append("full_name", values.name);
      formData.append("phone_number", values.phone);

      await axios.post(`${API_URL}/api/career/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      form.reset();
      setOpened(false);

      await showAlert(
        "Success",
        "success",
        "Application submitted successfully!",
        false,
        1500,
      );
    } catch (err) {
      console.error(err);

      await showAlert(
        "Failed",
        "error",
        err?.response?.data?.message || "Failed to submit application",
        false,
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-400">
        Position not found.
      </div>
    );
  }

  const status = recruitmentStatusMap[data.recruitment_status] ?? {
    label: "Unknown",
    color: "gray",
  };

  const educationDetails = data.education_details ?? [];

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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Back */}
        <button
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
          onClick={() => router.back()}
        >
          <IconArrowLeft size={16} /> Back to List
        </button>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-blue-700">
              {data.position || "-"}{" "}
              <span className="text-gray-500 font-normal">
                | {data.departement || "-"}
              </span>
            </h2>

            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <IconUsers size={14} />
              Needed: {data.qty ?? 0} {data.qty > 1 ? "people" : "person"}
            </div>
          </div>
          <Badge color={status.color} radius="sm" size="lg">
            {status.label}
          </Badge>
        </div>

        <Divider />

        {/* Job Description */}
        <Section icon={<IconBriefcase size={20} />} title="Job Description">
          <div className="border rounded-lg bg-gray-50 overflow-hidden">
            <ReactQuill
              theme="snow"
              value={data.job_description || ""}
              readOnly
              modules={{ toolbar: false }}
              style={{ backgroundColor: "#f1f3f5" }}
            />
          </div>
        </Section>

        <Divider />

        {/* Experience */}
        <Section icon={<IconClock size={20} />} title="Experience Required">
          <p className="text-gray-700">
            {data.experience_years != null
              ? `${data.experience_years} year${
                  data.experience_years !== 1 ? "s" : ""
                }`
              : "-"}
          </p>
        </Section>

        <Divider />

        {/* Education */}
        <Section icon={<IconBook size={20} />} title="Educational Background">
          {educationDetails.length === 0 ? (
            <p className="text-gray-400">
              No education requirements specified.
            </p>
          ) : (
            <p className="text-gray-700">
              {educationDetails
                .map((edu) => edu.detail_value)
                .filter(Boolean)
                .join(", ") || "-"}
            </p>
          )}
        </Section>

        <Divider />

        {/* Apply Button */}
        <div className="flex justify-end">
          <Button
            size="md"
            disabled={data.recruitment_status !== 1}
            onClick={() => setOpened(true)}
            type="submit"
            loading={submitting}
          >
            Apply Now
          </Button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Apply for this Position"
        centered
        size={700}
      >
        <form onSubmit={form.onSubmit(handleApply)}>
          <TextInput
            label="Email"
            placeholder="Email address"
            {...form.getInputProps("email")}
            mb="sm"
          />

          <TextInput
            label="Name"
            placeholder="Your full name"
            {...form.getInputProps("name")}
            mb="sm"
          />

          <TextInput
            label="Phone Number"
            placeholder="08xxxxxxxxxxx"
            {...form.getInputProps("phone")}
            onChange={(e) => {
              const val = e.currentTarget.value.replace(/\D/g, "");
              form.setFieldValue("phone", val);
            }}
            mb="sm"
          />

          <FileInput
            key={fileKey}
            label="Upload CV"
            placeholder="Choose file"
            accept="application/pdf,image/png,image/jpeg"
            {...form.getInputProps("file")}
            rightSection={
              form.values.file ? (
                <span
                  style={{ cursor: "pointer", color: "gray" }}
                  onClick={() => {
                    form.setFieldValue("file", null);
                    setFileKey((k) => k + 1);
                  }}
                >
                  ✕
                </span>
              ) : null
            }
            mb="md"
          />

          <Group justify="flex-end">
            <Button type="submit">Submit</Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
        {icon}
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}
