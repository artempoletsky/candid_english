
import { USER_ACTIONS_API, UserSelf } from "~/globals";
import { FUpdateUserInfo } from "../api/user/methods";
import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import { fetchCatch, useErrorResponse } from "@artempoletsky/easyrpc/react";
import { useForm } from "@mantine/form";
import TextInput from "../registration/Textnput";
import { Button, Checkbox, Tooltip } from "@mantine/core";
import { useContext, useState } from "react";
import { UserContext, UserStore } from "../components/context";
import { blinkBoolean } from "~/lib/utils_client";

const updateUserInfo = getAPIMethod<FUpdateUserInfo>(USER_ACTIONS_API, "updateUserInfo");



type Props = {
  user: UserSelf;
}

type FormType = {
  username: string;
  fullName: string;
  email: string;
  image: string;
  changePassword: boolean;
  password: string;
  newPassword: string;
  confirmNewPassword: string;
}
export default function FormUserData({ user }: Props) {


  const form = useForm<FormType>({
    initialValues: {
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      image: user.image,
      changePassword: false,
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    }
  })
  const [tooltipSaved, setTooltipSaved] = useState(false);
  const [setErrorResponse, mainErrorMessage, errorResponse] = useErrorResponse(form);
  const passwordRequired = form.isDirty("username") || form.isDirty("email") || form.values["changePassword"];
  const fc = fetchCatch(updateUserInfo)
    .before((values: FormType) => {
      const newInfo = {
        username: values.username,
        email: values.email,
        password: values.changePassword ? values.newPassword : undefined,
        fullName: values.fullName,
        image: values.image,
      };
      return {
        newInfo,
        password: passwordRequired ? values.password : undefined,
      }
    })
    .catch(setErrorResponse)
    .then(updatedUser => {
      UserStore.setUser(updatedUser);
      blinkBoolean(setTooltipSaved);
      form.setInitialValues({
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        image: updatedUser.image,
        changePassword: false,
        password: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    });

  function onSubmit(values: FormType) {
    fc.action(values)();
  }
  return (<div>
    <p className="">Edit your personal information:</p>
    <form action="" onSubmit={form.onSubmit(onSubmit)}>
      <TextInput {...form.getInputProps("fullName")} label="Full name" />
      <TextInput {...form.getInputProps("email")} label="E-mail" />
      <TextInput {...form.getInputProps("username")} label="Username" />
      <input type="hidden" value={form.values["image"]} />
      <div className="overflow-hidden transition duration-300 transition-all" style={{
        height: passwordRequired ? 62 : 0
      }}>
        <TextInput {...form.getInputProps("password")} type="password" label="Current password" />
      </div>
      <Checkbox className="my-3" {...form.getInputProps("changePassword")} label="Change password" />
      <div className="overflow-hidden transition duration-300 transition-all"
        style={{
          height: form.values.changePassword ? 150 : 0
        }}>
        <TextInput {...form.getInputProps("newPassword")} type="password" label="New password" />
        <TextInput {...form.getInputProps("confirmNewPassword")} type="password" label="Confirm new password" />
      </div>
      <Tooltip opened={tooltipSaved} label="Saved!">
        <Button className="mt-3" type="submit">Save changes</Button>
      </Tooltip>
    </form>
    <div className="text-red-600 min-h-[24px]">{mainErrorMessage}</div>
  </div>)
}