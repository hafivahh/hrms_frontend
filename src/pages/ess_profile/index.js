import AuthLayout from "@/components/layout/authLayout";
import { ess } from "@/data/sidebar/ess";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useUser from "@/store/useUser";
import {
  Paper,
  Grid,
  Text,
  Avatar,
  Badge,
  Loader,
  Group,
  Divider,
} from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function EssProfile() {
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { showAlert } = useSwal();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/ess_profile/me`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setProfile(data);
    } catch (error) {
      const data_error = error.response?.data || {
        message: "Error",
        error: "Failed to load profile",
      };

      showAlert(data_error.message, "error", data_error.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <AuthLayout sidebarList={ess}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder p="lg">
            {/* HEADER */}
            <Group align="center" mb="md">
              <IconUser size={22} />
              <Text fw={600} size="lg">
                Employee Self Service - Profile
              </Text>
            </Group>

            <Divider mb="lg" />

            {loading ? (
              <Loader />
            ) : profile ? (
              <>
                {/* PROFILE HEADER */}
                <Group mb="xl">
                  <Avatar size={80} radius="xl" color="blue">
                    {profile.full_name?.charAt(0).toUpperCase()}
                  </Avatar>

                  <div>
                    <Text fw={700} size="xl">
                      {profile.full_name}
                    </Text>

                    

                    <Badge
                      mt="xs"
                      color={profile.status_active === 1 ? "green" : "red"}
                    >
                      {profile.status_active === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </Group>

                {/* PERSONAL INFORMATION */}
                <Paper withBorder p="md" mb="lg">
                  <Text fw={600} mb="sm">
                    Personal Information
                  </Text>

                  <Grid>
                    <Grid.Col span={6}>
                      <Text size="sm" c="dimmed">
                        Badge Number
                      </Text>
                      <Text>{profile.badge_number || "-"}</Text>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Text size="sm" c="dimmed">
                        Email
                      </Text>
                      <Text>{profile.email || "-"}</Text>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Text size="sm" c="dimmed">
                        Gender
                      </Text>
                      <Text>
                        {profile.gender === 1
                          ? "Laki-Laki"
                          : profile.gender === 2
                            ? "Perempuan"
                            : "-"}
                      </Text>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Text size="sm" c="dimmed">
                        Join Date
                      </Text>
                      <Text>
                        {profile.join_date
                          ? new Date(profile.join_date).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </Text>
                    </Grid.Col>
                  </Grid>
                </Paper>
                {/* ORGANIZATION INFORMATION */}
                <Paper withBorder p="md">
                  <Text fw={600} mb="sm">
                    Organization Information
                  </Text>

                  <Grid>
                    <Grid.Col span={6}>
                      <Text size="sm" c="dimmed">
                        Company
                      </Text>
                      <Text>{profile.company?.company_name || "-"}</Text>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Text size="sm" c="dimmed">
                        Departement
                      </Text>
                      <Text>
                        {profile.departement?.departement_name || "-"}
                      </Text>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Text size="sm" c="dimmed">
                        Project
                      </Text>
                      <Text>{profile.project?.project_name || "-"}</Text>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Text size="sm" c="dimmed">
                        Position
                      </Text>
                      <Text>{profile.position?.position_name || "-"}</Text>
                    </Grid.Col>
                  </Grid>
                </Paper>
              </>
            ) : (
              <Text c="red">Profile not found</Text>
            )}
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
