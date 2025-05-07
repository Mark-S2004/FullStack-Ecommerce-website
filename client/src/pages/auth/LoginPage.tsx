import { useNavigate } from "react-router"
import {
  Controller,
  RegisterOptions,
  SubmitHandler,
  useForm,
} from "react-hook-form"
import { toast } from "react-toastify"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import FormControl from "@mui/material/FormControl"
import Link from "@mui/material/Link"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import Card from "@components/Card"
import { IUser } from "@/types/user.types"

type ICredentials = Pick<IUser, "email" | "password">

export default function LoginPage() {
  const navigate = useNavigate()

  const { mutate: loginUser } = useMutation<
    { data: { data: IUser } },
    AxiosError<{ message: string }>,
    ICredentials
  >({
    mutationFn: (credentials: ICredentials) => {
      return axios.post("/api/auth/login", credentials)
    },
  })

  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit: SubmitHandler<ICredentials> = async (credentials) => {
    loginUser(credentials, {
      onSuccess: (data) => {
        const { data: responseData } = data
        const user = responseData.data
        navigate(`/${user.role}`, { replace: true })
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || 'An error occurred during login'
        )
      },
    })
  }

  const formFields: {
    name: keyof ICredentials
    rules:
      | Omit<
          RegisterOptions<ICredentials, "email" | "password">,
          "setValueAs" | "disabled" | "valueAsNumber" | "valueAsDate"
        >
      | undefined
  }[] = [
    {
      name: "email",
      rules: { required: true, pattern: /\S+@\S+\.\S+/ },
    },
    {
      name: "password",
      rules: { required: true, minLength: 3 },
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
          {formFields.map((formField, index) => (
            <FormControl fullWidth key={index}>
              <Controller
                name={formField.name}
                control={control}
                rules={formField.rules}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    name={formField.name}
                    label={formField.name}
                    type={formField.name}
                    required
                    fullWidth
                    variant="outlined"
                    error={!!error}
                    helperText={error?.message}
                    color={error ? "error" : "primary"}
                  />
                )}
              />
            </FormControl>
          ))}

          <Button type="submit" fullWidth variant="contained">
            Sign in
          </Button>
        </Box>
        <Divider>or</Divider>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ textAlign: "center" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
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
