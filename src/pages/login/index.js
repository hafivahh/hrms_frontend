import { useState, useEffect } from "react"; 
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Alert,
} from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useRouter } from "next/router";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import axios from "axios";
import Cookies from "js-cookie";

export default function Login() {
  const router = useRouter();
  const { API_URL } = useApi();
  const { user, setUser } = useUser();

const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState("login"); // "login" | "forgot" | "sent"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

   // ← TAMBAHKAN INI
useEffect(() => {
  const token = Cookies.get("portal_login_token");

  if (token) {
    router.replace("/");
    return;
  }

  setChecking(false);
}, [router]);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setEmail("");
    setError("");
  };

  const handleLogin = async () => {
  if (!username || !password) {
    setError("Username and password are required");
    return;
  }
  try {
    setLoading(true);
    setError("");
    const res = await axios.post(`${API_URL}/api/auth/validate`, {
      username,
      password,
    });
    const data = res.data;

    Cookies.set("portal_login_token", data.access_token, { expires: 1 });
    Cookies.set("portal_login_name", data.name, { expires: 1 });
    Cookies.set("portal_login_id", String(data.id), { expires: 1 });

    console.log("BEFORE SETUSER - data:", {
  id: data.id,
  id_role: data.id_role,
  permissions: data.permissions,
  token: data.access_token ? "ada" : "tidak ada",
});

 const userData = {
  id: data.id,
  id_user: data.id,
  id_role: data.id_role,
  name: data.name,
  token: data.access_token,
  permissions: Array.isArray(data.permissions)
    ? data.permissions.map(Number)
    : [],
};

    setUser(userData);

    // simpan manual ke localStorage
  localStorage.setItem("user", JSON.stringify(userData));

   router.push("/");
  } catch (err) {
    setError("Invalid username or password");
  } finally {
    setLoading(false);
  }
};

  const handleForgotPassword = async () => {
    if (!username || !email) {
      setError("Username and email are required");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await axios.post(`${API_URL}/api/auth/forgot-password`, {
        username,
        email,
      });
      setMode("sent");
    } catch (err) {
      setError(
        err.response?.data?.message || "Username or email does not match",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Container size={420} w="100%">
        <Title align="center" mb="lg">
          HRMS Login
        </Title>

        <Paper shadow="md" p="lg" radius="md" withBorder>
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
              {error}
            </Alert>
          )}

          {/* ===== LOGIN ===== */}
          {mode === "login" && (
            <>
              <TextInput
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                required
              />
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                mt="md"
                required
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <Button fullWidth mt="xl" loading={loading} onClick={handleLogin}>
                Login
              </Button>
              <Button
                fullWidth
                mt="sm"
                variant="subtle"
                color="gray"
                onClick={() => {
                  resetForm();
                  setMode("forgot");
                }}
              >
                Forgot Password?
              </Button>
            </>
          )}

          {/* ===== FORGOT ===== */}
          {mode === "forgot" && (
            <>
              <Title order={5} mb="xs" c="dimmed">
                Reset Password
              </Title>
              <TextInput
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                required
              />
              <TextInput
                label="Email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                mt="md"
                required
              />
              <Button
                fullWidth
                mt="xl"
                loading={loading}
                onClick={handleForgotPassword}
              >
                Send Reset Link
              </Button>
              <Button
                fullWidth
                mt="sm"
                variant="subtle"
                color="gray"
                onClick={() => {
                  resetForm();
                  setMode("login");
                }}
              >
                Back to Login
              </Button>
            </>
          )}

          {/* ===== SENT ===== */}
          {mode === "sent" && (
            <>
              <Alert icon={<IconCheck size={16} />} color="green" mb="md">
                A password reset link has been sent to your registered email.
                Please check your inbox.
              </Alert>
              <Button
                fullWidth
                mt="sm"
                variant="subtle"
                color="gray"
                onClick={() => {
                  resetForm();
                  setMode("login");
                }}
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
