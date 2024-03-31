
import { API_USER_ACTIONS, UserSelf, zodRulesGlobal } from "app/globals";
import { FUpdateUserInfo } from "../api/user/methods";
import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import { fetchCatch, useErrorResponse } from "@artempoletsky/easyrpc/react";
import { useForm, zodResolver } from "@mantine/form";
import TextInput from "../registration/Textnput";
import { Button, Checkbox, Tooltip } from "@mantine/core";
import { useContext, useState } from "react";
import { blinkBoolean } from "lib/utils_client";
import z from "zod";

import { Store } from "app/StoreProvider";

const updateUserInfo = getAPIMethod<FUpdateUserInfo>(API_USER_ACTIONS, "updateUserInfo");



type Props = {
  user: UserSelf;
}



export default function FormUserData({ user: userInitial }: Props) {

  const [user, setUser] = useState(userInitial);
  const [changePassword, setChangePassword] = useState(!user.isPasswordSet);


  const ZForm = z.object({
    fullName: z.string(),
    email: zodRulesGlobal.email,
    username: zodRulesGlobal.username,
    image: z.string(),
    password: z.string(),
    newPassword: z.string(),
    confirmNewPassword: z.string(),
  }).superRefine(({ newPassword, confirmNewPassword, password }, ctx) => {
    if (changePassword) {
      let res = zodRulesGlobal.password.safeParse(newPassword, { path: ["newPassword"] });
      if (!res.success) {
        ctx.addIssue(res.error.issues[0]);
        return;
      }

      if (newPassword != confirmNewPassword) {
        ctx.addIssue({
          path: ["newPassword"],
          code: "custom",
          fatal: true,
          message: "Passwords don't match",
        });
        ctx.addIssue({
          path: ["confirmNewPassword"],
          code: "custom",
          fatal: true,
          message: "Passwords don't match",
        });
      }
    }
  });
  type FormType = z.infer<typeof ZForm>;

  const form = useForm<FormType>({
    initialValues: {
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      image: user.image,
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validate: zodResolver(ZForm),
  });

  const [tooltipSaved, setTooltipSaved] = useState(false);
  const [setErrorResponse, mainErrorMessage, errorResponse] = useErrorResponse(form);
  const passwordRequired = form.isDirty("username") || form.isDirty("email") || changePassword;
  const fc = fetchCatch(updateUserInfo)
    .before((values: FormType) => {
      console.log(values.username);
      
      const newInfo = {
        email: values.email,
        username: values.username,
        password: changePassword ? values.newPassword : undefined,
        fullName: values.fullName,
        image: values.image,
      };
      
      // console.log(newInfo);
      // return undefined;
      const sendPassword = passwordRequired && user.isPasswordSet;
      return {
        newInfo,
        password: sendPassword ? values.password : undefined,
      }
    })
    .catch(setErrorResponse)
    .then(updatedUser => {
      setUser(updatedUser);
      setChangePassword(false);
      Store.setUser(updatedUser);
      blinkBoolean(setTooltipSaved);
      form.setInitialValues({
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        username: updatedUser.username,
        image: updatedUser.image,
        password: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    });

  function onSubmit(values: FormType) {
    fc.action(values)();
  }
  return (<div className="mt-3">
    <p className="font-semibold font-lg mb-1">Edit your personal information:</p>
    <form action="" onSubmit={form.onSubmit(onSubmit)}>
      <TextInput {...form.getInputProps("fullName")} label="Full name" />
      <TextInput {...form.getInputProps("email")} label="E-mail" />
      <TextInput {...form.getInputProps("username")} label="Username" />
      <input type="hidden" value={form.values["image"]} />
      {user.isPasswordSet
        ? <>
          <div className="overflow-hidden transition duration-300 transition-all" style={{
            height: passwordRequired ? 62 : 0
          }}>
            <TextInput {...form.getInputProps("password")} type="password" label="Current password" />
          </div>
          <Checkbox className="my-3" checked={changePassword} onChange={e => setChangePassword(e.target.checked)} label="Change password" />
          <div className="overflow-hidden transition duration-300 transition-all"
            style={{
              height: changePassword ? 150 : 0
            }}>
            <TextInput {...form.getInputProps("newPassword")} type="password" label="New password" />
            <TextInput {...form.getInputProps("confirmNewPassword")} type="password" label="Confirm new password" />
          </div>
        </> : <div className="mt-3">
          <p className="mb-2">Please set up a password for you account:</p>
          <TextInput {...form.getInputProps("newPassword")} type="password" label="Password" />
          <TextInput {...form.getInputProps("confirmNewPassword")} type="password" label="Confirm password" />
        </div>}

      <Tooltip opened={tooltipSaved} label="Saved!">
        <Button className="mt-3" type="submit">Save changes</Button>
      </Tooltip>
    </form>
    <div className="text-red-600 min-h-[24px]">{mainErrorMessage}</div>
  </div>)
}