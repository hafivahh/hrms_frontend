import { useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Paper,
  Title,
  PasswordInput,
  Button,
  Alert,
} from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import axios from "axios";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const { API_URL } = useApi();
  const { showAlert } = useSwal();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!password) return setError("Password is required");
    if (password.length < 12)
      return setError("Password must be at least 12 characters");
    if (!/[0-9]/.test(password))
      return setError("Password must contain at least one number");
    if (!/[a-z]/.test(password))
      return setError("Password must contain at least one lowercase letter");
    if (!/[A-Z]/.test(password))
      return setError("Password must contain at least one uppercase letter");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
      return setError(
        "Password must contain at least one special character (!@#$%^&*...)",
      );
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (!token) return setError("Invalid or missing token");

    const confirm = await showAlert(
      "Save New Password?",
      "question",
      "Are you sure you want to save this new password?",
      true,
      null,
      "Yes, Save",
      "Cancel",
    );

    if (!confirm?.isConfirmed) return;

    try {
      setLoading(true);
      setError("");
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        password,
      });

      await showAlert(
        "Success",
        "success",
        "Password changed successfully! You will be redirected to the login page.",
        false,
        2000,
      );

      setSuccess(true);
      router.push("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Container size={420} w="100%">
        <Title align="center" mb="lg">
          Create New Password
        </Title>

        <Paper shadow="md" p="lg" radius="md" withBorder>
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
              {error}
            </Alert>
          )}

          {success ? (
            <Alert icon={<IconCheck size={16} />} color="green">
              Password changed successfully! Redirecting to login...
            </Alert>
          ) : (
            <>
              <PasswordInput
                label="New Password"
                placeholder="Min. 12 chars, uppercase, lowercase, number & special char"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
              />
              <PasswordInput
                label="Confirm Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                mt="md"
                required
                onKeyDown={(e) => e.key === "Enter" && handleReset()}
              />

              {/* PASSWORD POLICY */}
              <div className="text-sm bg-gray-50 p-4 rounded border mt-4">
                <p className="font-semibold mb-2">
                  Please Follow Password Configuration Policy Settings:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Minimum Length: 12 characters</li>
                  <li>Must contain at least one number</li>
                  <li>Must contain uppercase & lowercase letters</li>
                  <li>
                    Must contain at least one special character (!@#$%^&*...)
                  </li>
                </ul>
              </div>

              <Button fullWidth mt="xl" loading={loading} onClick={handleReset}>
                Save New Password
              </Button>
              <Button
                fullWidth
                mt="sm"
                variant="subtle"
                color="gray"
                onClick={() => router.push("/login")}
              >
                Back to Login
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </div>
  );
}
