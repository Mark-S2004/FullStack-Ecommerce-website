import { HTMLInputTypeAttribute } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  useForm,
  Controller,
  SubmitHandler,
  RegisterOptions,
} from "react-hook-form"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import Link from "@mui/material/Link"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import toast from 'react-hot-toast'
import Card from "@components/Card"
import { EUserRole, IUser } from "@/types/user.types"
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { useAuth } from "../../contexts/AuthContext"

type IRegisterCredentials = Pick<IUser, "email" | "password" | "name" | "role">

export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register, isLoading: authIsLoading } = useAuth()

  const { control, handleSubmit, setError } = useForm<IRegisterCredentials>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: EUserRole.CUSTOMER,
    },
  })

  const onSubmit: SubmitHandler<IRegisterCredentials> = async (credentials) => {
    try {
      await register(
        credentials.name,
        credentials.email,
        credentials.password,
        credentials.role
      )
      const from = location.state?.from?.pathname || "/"
      navigate(from, { replace: true })
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred during registration'
      toast.error(errorMessage)
      if (errorMessage.toLowerCase().includes('email')) {
        setError('email', { type: 'manual', message: errorMessage })
      } else if (errorMessage.toLowerCase().includes('name')) {
        setError('name', { type: 'manual', message: errorMessage })
      } else if (errorMessage.toLowerCase().includes('password')) {
        setError('password', { type: 'manual', message: errorMessage })
      } else {
        setError("root.serverError", { message: errorMessage })
      }
    }
  }

  const formFields: {
    name: keyof Omit<IRegisterCredentials, 'role'>
    label: string
    rules: Omit<RegisterOptions<IRegisterCredentials>, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"> | undefined
    type: HTMLInputTypeAttribute
  }[] = [
    {
      name: "name",
      label: "Full Name",
      rules: { required: "Name is required" },
      type: "text",
    },
    {
      name: "email",
      label: "Email Address",
      rules: { 
        required: "Email is required", 
        pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email address" }
      },
      type: "email",
    },
    {
      name: "password",
      label: "Password",
      rules: { 
        required: "Password is required", 
        minLength: { value: 3, message: "Password minimum length is 3" }
      },
      type: "password",
    },
  ]

  return (
    <>
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
          sx={{ display: "flex", flexDirection: "column", gap: 2, width: '100%' }}
        >
          {formFields.map((formField) => (
            <FormControl fullWidth key={formField.name}>
              <Controller
                name={formField.name}
                control={control}
                rules={formField.rules}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label={formField.label}
                    type={formField.type}
                    required={!!formField.rules?.required}
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    color={error ? "error" : "primary"}
                    disabled={authIsLoading}
                  />
                )}
              />
            </FormControl>
          ))}
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Controller
              name="role"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field, fieldState: { error } }) => (
                <Select
                  {...field}
                  label="Role"
                  labelId="role-select-label"
                  error={!!error}
                  disabled={authIsLoading}
                >
                  <MenuItem value={EUserRole.CUSTOMER}>Customer</MenuItem>
                  <MenuItem value={EUserRole.ADMIN}>Admin</MenuItem>
                </Select>
              )}
            />
          </FormControl>
          <Button type="submit" fullWidth variant="contained" disabled={authIsLoading}>
            {authIsLoading ? 'Signing up...' : 'Sign up'}
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
              onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              variant="body2"
              sx={{ alignSelf: "center" }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Card>
    </>
  )
}
