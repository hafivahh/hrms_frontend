import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Alert,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/router";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import axios from "axios";
import Cookies from "js-cookie"; 

export default function Login() {
  const router = useRouter();
  const { API_URL } = useApi(); 
  const { setUser } = useUser();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post(`${API_URL}/api/auth/validate`, {
        username,
        password,
      });

      const data = res.data;

      // Simpan ke cookie
      Cookies.set("portal_login_token", data.access_token, { expires: 1 });
      Cookies.set("portal_login_name", data.name, { expires: 1 });
      Cookies.set("portal_login_id", String(data.id), { expires: 1 });

      // Simpan ke Zustand
      setUser({
        id: data.id,
        name: data.name,
        token: data.access_token,
      });

      router.push("/portal/user");
    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      setError("Username atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Container size={420} w="100%">
        <Title align="center" mb="lg">
          Login HRMS
        </Title>

        <Paper shadow="md" p="lg" radius="md" withBorder>
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
              {error}
            </Alert>
          )}

          <TextInput
            label="Username"
            placeholder="Masukkan username"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            required
          />

          <PasswordInput
            label="Password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            mt="md"
            required
          />

          <Button fullWidth mt="xl" loading={loading} onClick={handleLogin}>
            Login
          </Button>
        </Paper>
      </Container>
    </div>
  );
}
