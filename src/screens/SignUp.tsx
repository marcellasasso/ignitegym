import { useNavigation } from '@react-navigation/native'
import { VStack, Image, Text, Center, Heading, ScrollView } from 'native-base'
import { useForm, Controller } from 'react-hook-form'

import LogoSvg from '@assets/logo.svg'
import backgrounImg from '@assets/background.png'

import { Input } from '@components/Input'
import { Button } from '@components/Button'

type FormDataProps = {
  name: string
  email: string
  password: string
  passwordConfirm: string
}

export function SignUp() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>()

  const navigation = useNavigation()

  function handleGoBack() {
    navigation.goBack()
  }

  function handleSignUp({
    name,
    email,
    password,
    passwordConfirm,
  }: FormDataProps) {
    console.log({
      name,
      email,
      password,
      passwordConfirm,
    })
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1} px={10} pb={16}>
        <Image
          source={backgrounImg}
          defaultSource={backgrounImg}
          alt="Pessoas treinando"
          resizeMode={'contain'}
          position={'absolute'}
        />

        <Center my={24}>
          <LogoSvg />

          <Text color={'gray.100'} fontSize={'sm'}>
            Treine sua mente e o seu corpo
          </Text>
        </Center>

        <Center>
          <Heading
            color={'gray.100'}
            fontSize={'xl'}
            mb={6}
            fontFamily={'heading'}
          >
            Crie sua conta
          </Heading>

          <Controller
            control={control}
            name="name"
            rules={{
              required: 'Informe o nome',
            }}
            render={({ field: { value, onChange } }) => (
              <Input
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
            rules={{
              required: 'Informe o e-mail.',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'E-mail inválido',
              },
            }}
            render={({ field: { value, onChange } }) => (
              <Input
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <Input
                placeholder="Senha"
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="passwordConfirm"
            render={({ field: { value, onChange } }) => (
              <Input
                placeholder="Confirme a Senha"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onSubmitEditing={handleSubmit(handleSignUp)}
                returnKeyType="send"
              />
            )}
          />

          <Button
            title="Criar e acessar"
            onPress={handleSubmit(handleSignUp)}
          />
        </Center>

        <Button
          mt={24}
          title="Voltar para o login"
          variant={'outline'}
          onPress={handleGoBack}
        />
      </VStack>
    </ScrollView>
  )
}
