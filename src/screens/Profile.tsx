import { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import {
  Center,
  Heading,
  ScrollView,
  Skeleton,
  Text,
  VStack,
  useToast,
} from 'native-base'

import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'

import defaultUserPhotoImg from '@assets/userPhotoDefault.png'

import { api } from '@services/api'
import { AppError } from '@utils/AppError'

import { useAuth } from '@hooks/useAuth'

import { ScreenHeader } from '@components/ScreenHeader'
import { UserPhoto } from '@components/UserPhoto'
import { Input } from '@components/Input'
import { Button } from '@components/Button'

const PHOTO_SIZE = 33

type FormDataProps = {
  name: string
  email: string
  old_password?: string | null
  password?: string | null
  confirm_password?: string | null
}

const profileSchema = yup.object({
  name: yup.string().required('Informe o nome.'),
  email: yup.string().required('Informe o email.'),
  oldPassword: yup.string().nullable(),
  password: yup
    .string()
    .nullable()
    .test({
      name: 'password',
      test(value, ctx) {
        const confirmPassword = ctx.parent.confirm_password

        if (confirmPassword?.length && !value?.length) {
          return ctx.createError({
            message: 'Informe a senha.',
          })
        }

        if (value?.length && value.length < 6) {
          return ctx.createError({
            message: 'A senha deve ter pelo menos 6 dígitos.',
          })
        }

        return true
      },
    }),
  confirm_password: yup
    .string()
    .nullable()
    .test({
      name: 'confirm_password',
      test(value, ctx) {
        const password = ctx.parent.password

        if (password?.length && !value?.length) {
          return ctx.createError({
            message: 'Informe a confirmação de senha.',
          })
        }

        if (password?.length && value !== password) {
          return ctx.createError({
            message: 'A confirmação de senha não confere.',
          })
        }

        return true
      },
    }),
})

export function Profile() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [photoIsLoading, setPhotoIsLoading] = useState(false)

  const { user, updateUserProfile } = useAuth()

  const toast = useToast()

  const {
    control,
    handleSubmit,
    formState: { errors },
    clearErrors,
    reset,
    watch,
  } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
      old_password: null,
      password: null,
      confirm_password: null,
    },
    resolver: yupResolver(profileSchema),
  })

  const password = watch('password')
  const confirmPassword = watch('confirm_password')

  async function handleUserPhotoSelect() {
    try {
      setPhotoIsLoading(true)

      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      })

      if (photoSelected.canceled) {
        return
      }

      if (photoSelected.assets.length && photoSelected.assets[0].uri) {
        const photoInfo: any = await FileSystem.getInfoAsync(
          photoSelected.assets[0].uri,
        )

        if (photoInfo.size && photoInfo.size / 1024 / 1024 > 5) {
          return toast.show({
            title: 'Essa imagem é muito grande. Escolha uma de até 5MB.',
            placement: 'top',
            bgColor: 'red.500',
          })
        }

        const fileExtension = photoSelected.assets[0].uri.split('.').pop()

        const photoFile = {
          name: `${user.name}.${fileExtension}`.toLowerCase(),
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`,
        } as any

        const userPhotoUploadForm = new FormData()

        userPhotoUploadForm.append('avatar', photoFile)

        const avatarUpdatedResponse = await api.patch(
          '/users/avatar',
          userPhotoUploadForm,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        )

        const userUpdated = user
        userUpdated.avatar = avatarUpdatedResponse.data.avatar

        await updateUserProfile(userUpdated)

        toast.show({
          title: 'Foto atualizada com sucesso!',
          placement: 'top',
          bgColor: 'green.500',
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setPhotoIsLoading(false)
    }
  }

  async function handleProfileUpdate(data: FormDataProps) {
    try {
      setIsUpdating(true)

      await api.put('/users', data)

      const userUpdated = user
      userUpdated.name = data.name

      await updateUserProfile(userUpdated)

      reset()

      toast.show({
        title: 'Perfil atualizado com sucesso!',
        placement: 'top',
        bgColor: 'green.500',
      })
    } catch (error) {
      const isAppError = error instanceof AppError

      const title = isAppError
        ? error.message
        : 'Não foi possível alterar os dados. Tente novamente mais tarde.'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    if (!password?.length && !confirmPassword?.length) {
      clearErrors('password')
      clearErrors('confirm_password')
    }
  }, [clearErrors, password, confirmPassword])

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />

      <ScrollView
        _contentContainerStyle={{
          paddingBottom: 36,
        }}
      >
        <Center mt={6} px={10}>
          {photoIsLoading ? (
            <Skeleton
              w={PHOTO_SIZE}
              h={PHOTO_SIZE}
              rounded={'full'}
              startColor={'gray.500'}
              endColor={'gray.400'}
            />
          ) : (
            <UserPhoto
              source={
                user.avatar
                  ? {
                      uri: `${api.defaults.baseURL}/avatar/${user.avatar}`,
                    }
                  : defaultUserPhotoImg
              }
              alt="Imagem do usuário"
              size={PHOTO_SIZE}
            />
          )}

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text
              color={'green.500'}
              fontSize={'md'}
              mt={2}
              mb={8}
              fontFamily={'heading'}
            >
              Alterar foto
            </Text>
          </TouchableOpacity>

          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <Input
                bg={'gray.600'}
                placeholder="Nome"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <Input
                bg={'gray.600'}
                placeholder="E-mail"
                value={value}
                onChangeText={onChange}
                isDisabled
              />
            )}
          />

          <Heading
            fontFamily={'heading'}
            color={'gray.200'}
            fontSize={'md'}
            mb={2}
            alignSelf={'flex-start'}
            mt={12}
          >
            Alterar senha
          </Heading>

          <Controller
            control={control}
            name="old_password"
            render={({ field: { value, onChange } }) => (
              <Input
                bg={'gray.600'}
                placeholder="Senha antiga"
                secureTextEntry
                value={value || ''}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <Input
                bg={'gray.600'}
                placeholder="Nova senha"
                secureTextEntry
                value={value || ''}
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirm_password"
            render={({ field: { value, onChange } }) => (
              <Input
                bg={'gray.600'}
                placeholder="Confirme a nova senha"
                secureTextEntry
                value={value || ''}
                onChangeText={onChange}
                errorMessage={errors.confirm_password?.message}
              />
            )}
          />

          <Button
            title="Atualizar"
            mt={4}
            onPress={handleSubmit(handleProfileUpdate)}
            isLoading={isUpdating}
          />
        </Center>
      </ScrollView>
    </VStack>
  )
}
