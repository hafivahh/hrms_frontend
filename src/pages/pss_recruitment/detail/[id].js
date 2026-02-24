/* eslint-disable @next/next/no-img-element */
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
  const router = useRouter();
  const { id } = router.query;
  const { decrypt } = useDecrypt();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      address: "",
      phone: "",
      file: null,
    },
    validate: {
      name: (value) => (!value ? "Name is required" : null),
      address: (value) => (!value ? "Address is required" : null),
      phone: (value) => (!value ? "Phone number is required" : null),
      file: (value) => (!value ? "File is required" : null),
    },
  });

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const decryptedId = decrypt(id);
      const res = await axios.get(
        `${API_URL}/api/pss_recruitment/${decryptedId}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (values) => {
    try {
      const decryptedId = decrypt(id);

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("address", values.address);
      formData.append("phone", values.phone);
      formData.append("file", values.file);

      await axios.post(
        `${API_URL}/api/pss_recruitment/${decryptedId}/apply`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      form.reset();
      setOpened(false);
      alert("Application submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit application");
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
      {/* Hero */}
      <div className="relative w-full h-[300px]">
        <img
          src="/images/recruitment.jpg"
          alt="Recruitment Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute bottom-8 left-10 text-white">
          <h1 className="text-3xl font-bold">{data.position || "-"}</h1>
          <p className="mt-1 text-sm opacity-80">Open Recruitment</p>
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
              {data.position || "-"}
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
            {...form.getInputProps("name")}
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
            placeholder="08xxxxxxxxxx"
            {...form.getInputProps("phone")}
            mb="sm"
          />

          <FileInput
            label="Upload CV"
            placeholder="Choose file"
            accept="application/pdf"
            {...form.getInputProps("file")}
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
