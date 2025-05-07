import { useNavigate, useLocation } from "react-router-dom"
import {
  Controller,
  SubmitHandler,
  useForm,
} from "react-hook-form"
import toast from 'react-hot-toast'
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import FormControl from "@mui/material/FormControl"
import Link from "@mui/material/Link"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import Card from "@components/Card"
import { IUser } from "@/types/user.types"
import { useAuth } from "../../contexts/AuthContext"

type ICredentials = Pick<IUser, "email" | "password">

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading: authIsLoading } = useAuth()

  const { control, handleSubmit, setError } = useForm<ICredentials>({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit: SubmitHandler<ICredentials> = async (credentials) => {
    try {
      await login(credentials.email, credentials.password)
      const from = location.state?.from?.pathname || "/"
      navigate(from, { replace: true })
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred during login'
      toast.error(errorMessage)
      if (errorMessage.toLowerCase().includes('email')) {
        setError('email', { type: 'manual', message: errorMessage })
      } else if (errorMessage.toLowerCase().includes('password')) {
        setError('password', { type: 'manual', message: errorMessage })
      } else {
        setError('root.serverError', { type: 'manual', message: errorMessage })
      }
    }
  }

  const formFields: {
    name: keyof ICredentials
    label: string
    type: string
    rules: any
  }[] = [
    {
      name: "email",
      label: "Email Address",
      type: "email",
      rules: { 
        required: "Email is required", 
        pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email address" }
      },
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      rules: { 
        required: "Password is required", 
        minLength: { value: 3, message: "Password must be at least 3 characters"}
      },
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
          Sign in
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 2,
          }}
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
                    required
                    fullWidth
                    variant="outlined"
                    error={!!error}
                    helperText={error?.message}
                    color={error ? "error" : "primary"}
                    disabled={authIsLoading}
                  />
                )}
              />
            </FormControl>
          ))}

          <Button type="submit" fullWidth variant="contained" disabled={authIsLoading}>
            {authIsLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </Box>
        <Divider>or</Divider>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ textAlign: "center" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              onClick={(e) => { e.preventDefault(); navigate('/register'); }}
              variant="body2"
              sx={{ alignSelf: "center" }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Card>
    </>
  )
}
