import React, { useState } from 'react'
import { Alert, Button, Form, Input, Modal } from 'antd'
import Router from 'next/router'
import HeadMeta from '../utils/HeadMeta'
import { getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { ProfileUpdate, OptionIpfsContent, IpfsContent, OptionText } from '@darkpay/dark-types/substrate/classes'
import { IpfsCid } from '@darkpay/dark-types/substrate/interfaces'
import { ProfileContent, AnyAccountId, ProfileData } from '@darkpay/dark-types'
import { newLogger } from '@darkpay/dark-utils'
import { useDarkdotApi } from '../utils/DarkdotApiContext'
import { DfForm, DfFormButtons, minLenError, maxLenError } from '../forms'
import DfMdEditor from '../utils/DfMdEditor'
import { withMyProfile } from './address-views/utils/withLoadedOwner'
import { accountUrl } from '../urls'
import { NAME_MIN_LEN, NAME_MAX_LEN, DESC_MAX_LEN } from 'src/config/ValidationsConfig'
import { UploadAvatar } from '../uploader'
import { resolveCidOfContent } from '@darkpay/dark-api/utils'
import messages from 'src/messages'
// import { getB64PrivKey, getB64PubKey, getNewKeys } from '../utils/Encrypt'
// import { useCookies } from 'react-cookie';
// import { Collapse } from 'antd';
import { useMyAccount } from '../auth/MyAccountContext'
import * as openpgp from 'openpgp';
import Section from '../utils/Section'
import { Divider, Typography } from 'antd';

const { Text } = Typography;



// const { Panel } = Collapse


const log = newLogger('EditProfile')


// PGP functions
// ✅ Using a type as Promise<Type>
type D4rkPGP = {
  privateKey: string;
  publicKey: string;
  revocationCertificate: string
};

async function createD4rkPGP(username: string, password: string): Promise<D4rkPGP> {
  try {
    const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
      type: 'ecc', // Type of the key, defaults to ECC
      curve: 'curve25519', // ECC curve name, defaults to curve25519
      userIDs: [{ name: 'Jon Smith', email: 'jon@example.com' }], // you can pass multiple user IDs
      passphrase: 'super long and hard to guess secret', // protects the private key
      format: 'armored' // output key format, defaults to 'armored' (other options: 'binary' or 'object')
  });

  console.log(privateKey);     // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
  console.log(publicKey);      // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
  console.log(revocationCertificate); // '-----BEGIN PGP PUBLIC KEY BLOCK ... '

  let Privbuff = Buffer.from(privateKey, 'utf8')
  let Pubbuff = Buffer.from(publicKey, 'utf8')
  let revbuff = Buffer.from(revocationCertificate, 'utf8')

  return { privateKey: Privbuff.toString('hex'), publicKey: Pubbuff.toString('hex'), revocationCertificate: revbuff.toString('hex') }

  }
  catch(error) {
    console.log('@@@ ERROR PGP user ');
    console.log(error)
    openNotification('PGP error','There was an error generating your keys, please try again.','bottomRight');
    return { privateKey: '', publicKey: '', revocationCertificate:''}
  }
}



// PGP MODAL

interface Values {
  username: string;
  password: string;
}

interface PgPCreateFormProps {
  visible: boolean;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const PgPCreateForm: React.FC<PgPCreateFormProps> = ({
  visible,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const { state: { address } } = useMyAccount()


  
  return (
    <Modal
      visible={visible}
      title="Generate your DARK keys"
      okText="Create my keys"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            form.resetFields();
            onCreate(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
    >

      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ username: address }}
      >
      <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
            hidden
          >
            <Input
              //placeholder={address}
              //defaultValue={address}
              value={address}
              readOnly
              hidden
            />
          </Form.Item>
  
          <Form.Item
            label="Please choose a password to encrypt your keys"
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be minimum 8 characters.' }
            ]}
  
          >
            <Input.Password
            />
          </Form.Item>

      </Form>
      <Alert
      message="Save your password and key"
      description="Your keys are generated client-side (in your browser) and there is no way to recover if you loose them."
      type="warning"
      showIcon
      closable={false}
    />
    </Modal>
  );
};


// Profile Form
type Content = ProfileContent

type FormValues = Partial<Content>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

type FormProps = {
  address: AnyAccountId,
  owner?: ProfileData
}

function getInitialValues ({ owner }: FormProps): FormValues {
  if (owner) {
    const { content } = owner
    return { ...content }
  }
  return {}
}



export function InnerForm (props: FormProps) {
  const [ form ] = Form.useForm()
  const { ipfs } = useDarkdotApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>()
  const [ DarkPubKey, setDarkPubKey ] = useState("")
  const [ DarkPrivKey, setDarkPrivKey ] = useState("")
  const { owner, address } = props
  const isProfile = owner?.profile
  const initialValues = getInitialValues(props)

  const [visible, setVisible] = useState(false);

  // on key creation
  const onCreate = async (values: any) => {
    console.log('Received values of PGP form: ', values);
    const keys = await createD4rkPGP(values.username, values.password);
    const privbase64 = Buffer.from(keys.privateKey, 'hex').toString('ascii');
    const pubbase64 = Buffer.from(keys.publicKey, 'hex').toString('ascii');

    setDarkPubKey(keys.publicKey)
    setDarkPrivKey(keys.privateKey)
    form.setFieldsValue({ [fieldName('gpg')]: keys.publicKey })

console.log(keys)  
console.log('------ decoded hex keys -----------' )
console. log('priv : '+privbase64 + 'pub : '+pubbase64 )
    // const unlockSuccess = unlockD4rkWallet(values.username, values.password);
    // setD4rkUnlocked(await unlockSuccess)
    setVisible(false);
  };


  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
     const fieldValues = getFieldValues()

    // /** Returns `undefined` if value hasn't been changed. */
    // function getValueIfChanged (field: FieldName): any | undefined {
    //   return form.isFieldTouched(field) ? fieldValues[field] as any : undefined
    // }

    /** Returns `undefined` if CID hasn't been changed. */
    function getCidIfChanged (): IpfsCid | undefined {
      const prevCid = resolveCidOfContent(owner?.profile?.content)
      return prevCid !== cid.toString() ? cid : undefined
    }

    console.log(fieldValues['gpg'])

    if (!isProfile) {
      return [ new IpfsContent(cid), fieldValues['gpg'] ];
    } else {
      // Update only dirty values.

      const update = new ProfileUpdate({
        content: new OptionIpfsContent(getCidIfChanged()),
        gpg: new OptionText(fieldValues['gpg'])
      })

      return [ update ]
    }
  }

  const fieldValuesToContent = (): Content => {
    return getFieldValues() as Content
  }

  // TODO pin to IPFS only if JSON changed.
  const pinToIpfsAndBuildTxParams = () => getTxParams({
    json: fieldValuesToContent(),
    buildTxParamsCallback: newTxParams,
    setIpfsCid,
    ipfs
  })

  const goToView = () => {
    if (address) {
      Router.push('/accounts/[address]', accountUrl({ address })).catch(err => log.error('Error while route:', err));
    }
  };

  const onFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err))
  }

  const onSuccess: TxCallback = () => {
    goToView()
  }

  const onDescChanged = (mdText: string) => {
    form.setFieldsValue({ [fieldName('about')]: mdText })
  }

  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('avatar')]: url })
  }

  const onPubKeyChanged = (gpg: string) => {
    form.setFieldsValue({ [fieldName('gpg')]: gpg })
  }

//   const crypto = require('crypto');

//   const alice = getNewKeys()
  
//   const bob = getNewKeys()
  
// log.warn(alice)

//   // Alice's Data
//   console.log("\nAlice Public:", getB64PubKey(alice));
//   console.log("Alice Private:", getB64PrivKey(alice), "\n");

//   const [cookies, setCookie] = useCookies(['drkprv']);

//   setCookie('drkprv', encodeURIComponent(getB64PrivKey(alice)), { path: '/' });

//   // Bob's Data
//   console.log("Bob Public:", getB64PubKey(bob));
//   console.log("Bob Private:", getB64PubKey(bob), "\n");
  
//   // The Shared Secret will be the same
//   const AliceSharedSecret = alice.computeSecret(bob.getPublicKey(), null, 'base64');
//   const BobSharedSecret = bob.computeSecret(alice.getPublicKey(), null, 'base64');
//   // const AliceSharedSecret = deriveSecretKey(Buffer.from(getB64PrivKey(alice), 'base64'), Buffer.from(getB64PubKey(bob), 'base64'));
//   // const BobSharedSecret = deriveSecretKey(Buffer.from(getB64PrivKey(bob), 'base64'), Buffer.from(getB64PubKey(alice), 'base64'));

//   console.log("Alice Shared Secret: ", AliceSharedSecret);
//   console.log("Bob Shared Secret: ", BobSharedSecret);
  
// const algorithm = "aes-256-cbc"; 

// // generate 16 bytes of random data
// const initVector = crypto.randomBytes(16);

// // protected data
// const message = "This is a secret message";

// // secret key generate 32 bytes of random data
// // const Securitykey = crypto.randomBytes(32);
// const Securitykey = Buffer.from(AliceSharedSecret, 'base64')



// // the cipher function
// const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);

// // encrypt the message
// // input encoding
// // output encoding
// let encryptedData = cipher.update(message, "utf-8", "hex");

// encryptedData += cipher.final("hex");

// console.log("Encrypted message: " + encryptedData);

// // the decipher function
// const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);

// let decryptedData = decipher.update(encryptedData, "hex", "utf-8");

// //decryptedData += decipher.final("utf8");

// console.log("Decrypted message: " + decryptedData);

// if (!isProfile) {
//   form.setFieldsValue({ [fieldName('gpg')]: alice.getPublicKey().toString('base64') })
// }


/*******  PGP STUFF   */



  return <>

    <DfForm form={form} initialValues={initialValues}>

      <Form.Item
        name={fieldName('avatar')}
        label='Avatar'
        help={messages.imageShouldBeLessThanTwoMB}
      >
        <UploadAvatar onChange={onAvatarChanged} img={initialValues.avatar} />
      </Form.Item>

      <Form.Item
        name={fieldName('name')}
        label='Profile name'
        hasFeedback
        rules={[
          // { required: true, message: 'Name is required.' },
          { min: NAME_MIN_LEN, message: minLenError('Name', NAME_MIN_LEN) },
          { max: NAME_MAX_LEN, message: maxLenError('Name', NAME_MAX_LEN) }
        ]}
      >
        <Input placeholder='Full name or nickname' />
      </Form.Item>

      <Form.Item
        name={fieldName('about')}
        label='About'
        hasFeedback
        rules={[
          { max: DESC_MAX_LEN, message: maxLenError('Description', DESC_MAX_LEN) }
        ]}
      >
        <DfMdEditor onChange={onDescChanged} />
      </Form.Item>

      {/* <Form.Item
        name={fieldName('gpg')}
        label='Dark PubKey'
      >
        <Input placeholder={DarkPubKey} value={DarkPubKey}  />
      </Form.Item> */}


      {/* <Form.Item
        name={fieldName('gpg')}
        label='Dark PrivKey'
      >
        <Input placeholder={DarkPrivKey} />
      </Form.Item> */}

{ DarkPubKey
? 
<Section>
<Form.Item
name={fieldName('gpg')}
label='Dark PubKey'
>
<Input placeholder={DarkPubKey} value={DarkPubKey} readOnly />
</Form.Item>

<Section className="DarkPrivBox">
<Alert
      message="Save your password and key"
      description="Your keys are generated client-side (in your browser) and there is no way to recover if you loose them."
      type="warning"
      showIcon
      closable={false}
    />
     <Text code>{DarkPrivKey}</Text>
  
  
  </Section>



</Section>
:
<Section className="d4rk-swap-desc spaced-top padded-top">
  <p className="d4rk-swap-desc ">Please generate your PGP keys first, they will be used to encrypt your data. Once done you can save your profile.</p>
      <Button
         type="primary"
         onClick={() => {
           setVisible(true);
         }}
       >
         {isProfile? <span>Generate new keys</span> : <span>Generate my keys</span>}
       </Button>

       <PgPCreateForm
         visible={visible}
         onCreate={onCreate}
         onCancel={() => {
         setVisible(false);
         }}
       />
</Section>
}



{/* 
      <Collapse accordion>
    <Panel header="Public keys" key={address.toString()}>
      <Form.Item
        name={fieldName('gpg')}
        label='DARK pubkey'
        
      >
        <Input readOnly />
      </Form.Item>

      <Form.Item
        name={fieldName('d4rk')}
        label='D4RK address'
        hasFeedback
        rules={[
          // { required: true, message: 'Name is required.' },
          { min: NAME_MIN_LEN, message: minLenError('Name', NAME_MIN_LEN) },
          { max: NAME_MAX_LEN, message: maxLenError('Name', NAME_MAX_LEN) }
        ]}
      >
        <Input placeholder='Not available yet' />
      </Form.Item>
      </Panel>
        </Collapse> */}

<Section className="spaced-top padded-top">
<DfFormButtons
        form={form}
        txProps={{
          label: isProfile
            ? 'Update profile'
            : 'Create new profile',
          tx: isProfile
            ? 'profiles.updateProfile'
            : 'profiles.createProfile',
          params: pinToIpfsAndBuildTxParams,
          onSuccess,
          onFailed
        }}
      />
</Section>

    </DfForm>




  </>
}

// function bnToNum (bn: Codec, _default: number): number {
//   return bn ? (bn as unknown as BN).toNumber() : _default
// }

export function FormInSection (props: FormProps) {
  const { owner } = props
  const title = owner?.profile ? `Edit profile` : `New profile`

  return <>
    <HeadMeta title={title} />
      <InnerForm {...props} />
  </>
}

export const EditProfile = withMyProfile(FormInSection)

export const NewProfile = withMyProfile(FormInSection)

export default NewProfile
function openNotification(arg0: string, arg1: string, arg2: string) {
  throw new Error('Function not implemented.')
}

