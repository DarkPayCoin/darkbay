import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useMutation } from "react-query";
import Section from "src/components/utils/Section";
import D4rkServiceAPI from "../api/D4rkService"
import { Form, Input, Button, Checkbox } from 'antd';
import Router from 'next/router'



type CreateD4rkAccountProps = {
  address: string
}

const CreateD4rkAccount: React.FC<CreateD4rkAccountProps> = ({ address }) => {
  const [d4rkExists, setD4rkExists] = useState(false);


  const checkExists = async (Dotaddrr: any) => {

    try {
      const res = await D4rkServiceAPI.userExists(
        {
          username: Dotaddrr
        });
      console.log(res.msg);
      setD4rkExists(true);
    } catch (error) {
      // console.error(error);
      setD4rkExists(false);
    }
  }
  const [postDescription, setPostDescription] = useState("");
  const [postResult, setPostResult] = useState<string | null>(null);
  const fortmatResponse = (res: any) => {
    return JSON.stringify(res, null, 2);
  };
  const { isLoading: isPostingD4rk, mutate: postD4rk } = useMutation<any, Error>(
    async () => {
      return await D4rkServiceAPI.createAccount(
        {
          username: address,
          password: postDescription
        });
    },
    {
      onSuccess: (res) => {
        setPostResult(fortmatResponse(res));
        Router.push('/d4rk')

      },
      onError: (err: any) => {
        setPostResult(fortmatResponse(err.response?.data || err));
      },
    }
  );

  useEffect(() => {
    checkExists(address);
    if (isPostingD4rk) setPostResult("posting...");
  }, [isPostingD4rk, address]);
  function postData() {
    try {
      postD4rk();
    } catch (err) {
      setPostResult(fortmatResponse(err));
    }
  }

  if (d4rkExists) return (
    <Section>
      <p>There is already a D4RK wallet link to this account.</p>
      <span><Button>
        <Link href="/d4rk">Back to claim</Link>
      </Button></span>
    </Section>);


  return (
    <Section>

      <p className="spaced-top">Please choose a password to encrypt your D4RK account.</p>

      <Form>

        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
          hidden
        >
          <Input
            placeholder={address}
            type="text"
            value={address}
            readOnly
            hidden
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 8, message: 'Password must be minimum 8 characters.' }
          ]}

        >
          <Input.Password
            value={postDescription}
            onChange={(e) => setPostDescription(e.target.value)}
          />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked">
          <Checkbox disabled>I saved my password somewhere, and i understand if i loose it i may loose my funds.</Checkbox>
        </Form.Item>


        <Button className="antd-btn antd-btn-primary padded-top" onClick={postData}>
          Create D4RK account
          </Button>
        {postResult && (
          <div className="alert alert-secondary mt-2" role="alert">
            <pre>{postResult}</pre>
          </div>
        )}
      </Form>
    </Section>
  );
}
export default CreateD4rkAccount;