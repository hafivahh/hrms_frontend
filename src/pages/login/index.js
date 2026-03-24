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
  const { setUser } = useUser();

  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      Cookies.set("portal_login_role", String(data.id_role), { expires: 1 });

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
        err.response?.data?.message || "Username or email does not match"
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  return (
    <div className="h-screen flex overflow-hidden">
      
      {/* ===== LEFT SIDE ===== */}
      <div className="hidden md:flex w-1/2 bg-sky-700 text-white items-center justify-center">
        <div className="text-center max-w-md animate-fade">
          <h1 className="text-4xl font-bold leading-tight">
            Welcome <br />
            to the <br />
            HRMS System 👋
          </h1>

          <p className="mt-4 text-sm opacity-80">
            Manage your employee system efficiently and improve productivity.
          </p>
        </div>
      </div>

      {/* ===== RIGHT SIDE ===== */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
        <Container size={420} w="100%">
          <Title align="center" mb="lg">
            Welcome Back!
          </Title>

          <Paper shadow="md" p="lg" radius="md" withBorder>
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
                {error}
              </Alert>
            )}

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

            {mode === "forgot" && (
              <>
                <Title order={5} mb="xs" c="dimmed">
                  Reset Password
                </Title>

                <TextInput
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                  required
                />

                <TextInput
                  label="Email"
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
                  onClick={() => {
                    resetForm();
                    setMode("login");
                  }}
                >
                  Back to Login
                </Button>
              </>
            )}

            {mode === "sent" && (
              <>
                <Alert icon={<IconCheck size={16} />} color="green" mb="md">
                  Reset link sent. Check your email.
                </Alert>

                <Button
                  fullWidth
                  mt="sm"
                  variant="subtle"
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
    </div>
  );
}