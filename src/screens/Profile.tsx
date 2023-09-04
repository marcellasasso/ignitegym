import { useState } from 'react'
import { Alert, TouchableOpacity } from 'react-native'

import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'

import {
  Center,
  Heading,
  ScrollView,
  Skeleton,
  Text,
  VStack,
  useToast,
} from 'native-base'

import { ScreenHeader } from '@components/ScreenHeader'
import { UserPhoto } from '@components/UserPhoto'
import { Input } from '@components/Input'
import { Button } from '@components/Button'

const PHOTO_SIZE = 33

export function Profile() {
  const [photoIsLoading, setPhotoIsLoading] = useState(false)
  const [userPhoto, setUserPhoto] = useState(
    'https://github.com/marcellasasso.png',
  )

  const toast = useToast()

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

        setUserPhoto(photoSelected.assets[0].uri)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setPhotoIsLoading(false)
    }
  }

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
              source={{
                uri: userPhoto,
              }}
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

          <Input bg={'gray.600'} placeholder="Nome" />

          <Input
            bg={'gray.600'}
            placeholder="E-mail"
            value="email@email.com"
            isDisabled
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

          <Input bg={'gray.600'} placeholder="Senha antiga" secureTextEntry />

          <Input bg={'gray.600'} placeholder="Nova senha" secureTextEntry />

          <Input
            bg={'gray.600'}
            placeholder="Confirme a nova senha"
            secureTextEntry
          />
          <Button title="Atualizar" mt={4} />
        </Center>
      </ScrollView>
    </VStack>
  )
}
