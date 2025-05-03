import { HTMLInputTypeAttribute } from "react"
import { useNavigate } from "react-router"
import {
  useForm,
  Controller,
  SubmitHandler,
  RegisterOptions,
} from "react-hook-form"
import { DevTool } from "@hookform/devtools"
import { useMutation } from "@tanstack/react-query"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import Link from "@mui/material/Link"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { toast } from "react-toastify"
import Card from "@components/Card"
import axios, { AxiosError } from "axios"
import { EUserRole } from "@/types/user.types"
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { IUser } from "@/types/user.types"

export default function SignupPage() {
  const navigate = useNavigate()

  const { mutate: registerUser } = useMutation({
    mutationFn: (user: IUser) => {
      return axios.post("/api/auth/signup", user)
    },
  })

  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: EUserRole.CUSTOMER,
    },
  })

  const formFields: {
    label: keyof IUser
    rules:
      | Omit<
          RegisterOptions<IUser, "email" | "password" | "name" | "role">,
          "setValueAs" | "disabled" | "valueAsNumber" | "valueAsDate"
        >
      | undefined
    type: HTMLInputTypeAttribute
  }[] = [
    {
      label: "name",
      rules: { required: true },
      type: "text",
    },
    {
      label: "email",
      rules: { required: true, pattern: /\S+@\S+\.\S+/ },
      type: "email",
    },
    {
      label: "password",
      rules: { required: true, minLength: 3 },
      type: "password",
    },
  ]

  const onSubmit: SubmitHandler<IUser> = async (data) => {
    registerUser(data, {
      onSuccess: () => {
        toast.success("Signed Up Successfully")
        navigate("/auth/login")
      },
      onError: (error: unknown) => {
        const axiosError = error as AxiosError;
        toast.error(
          `An error occurred.\n${axiosError.response?.data && typeof axiosError.response.data === 'object' && 'message' in axiosError.response.data ? axiosError.response.data.message : 'Unknown error'} [${axiosError.response?.status || 'N/A'}]`
        );
      },
    })
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card variant="outlined">
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
        >
          Sign up
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {formFields.map((formField, index) => (
            <FormControl fullWidth key={index}>
              <Controller
                name={formField.label}
                control={control}
                rules={formField.rules}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    name={formField.label}
                    label={formField.label}
                    type={formField.type}
                    required
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    color={error ? "error" : "primary"}
                  />
                )}
              />
            </FormControl>
          ))}
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Age</InputLabel>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Role"
                  labelId="demo-simple-select-label"
                >
                  <MenuItem value={EUserRole.CUSTOMER}>Customer</MenuItem>
                  <MenuItem value={EUserRole.ADMIN}>Admin</MenuItem>
                </Select>
              )}
            />
          </FormControl>
          <Button type="submit" fullWidth variant="contained">
            Sign up
          </Button>
        </Box>
        <Divider>
          <Typography sx={{ color: "text.secondary" }}>or</Typography>
        </Divider>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ textAlign: "center" }}>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              variant="body2"
              sx={{ alignSelf: "center" }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Card>

      <DevTool control={control} />
    </Box>
  )
}
