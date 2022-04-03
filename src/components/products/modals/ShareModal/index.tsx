import React, { useState } from 'react';
import { withCalls, withMulti, getTxParams, storefrontsQueryToProp } from 'src/components/substrate';
import { Modal } from 'antd';
import Button from 'antd/lib/button';
import { withMyAccount, MyAccountProps } from 'src/components/utils/MyAccount';
import { LabeledValue } from 'antd/lib/select';
import SelectStorefrontPreview from 'src/components/utils/SelectStorefrontPreview';
import BN from 'bn.js';
import { ProductExtension, SharedProduct, IpfsContent } from '@darkpay/dark-types/substrate/classes';
import { useForm, Controller, ErrorMessage } from 'react-hook-form';
import { useDarkdotApi } from 'src/components/utils/DarkdotApiContext';
import { IpfsCid } from '@darkpay/dark-types/substrate/interfaces';
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton';
import dynamic from 'next/dynamic';
import { buildShareProductValidationSchema } from 'src/components/products/ProductValidation';
import { isEmptyArray, nonEmptyArr } from '@darkpay/dark-utils';
import DfMdEditor from 'src/components/utils/DfMdEditor';
import { DynamicProductPreview } from 'src/components/products/view-product/DynamicProductPreview';
import { CreateStorefrontButton } from 'src/components/storefronts/helpers';
import styles from './index.module.sass'
import modalStyles from 'src/components/products/modals/index.module.sass'
import NoData from 'src/components/utils/EmptyList';

const TxButton = dynamic(() => import('src/components/utils/TxButton'), { ssr: false });

type Props = MyAccountProps & {
  productId: BN
  storefrontIds?: BN[]
  open: boolean
  onClose: () => void
}

const Fields = {
  body: 'body'
}

const InnerShareModal = (props: Props) => {
  const { open, onClose, productId, storefrontIds } = props;

  if (!storefrontIds) {
    return null
  }

  const extension = new ProductExtension({ SharedProduct: productId as SharedProduct });

  const { ipfs } = useDarkdotApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>();
  const [ storefrontId, setStorefrontId ] = useState(storefrontIds[0]);

  const { control, errors, formState, watch } = useForm({
    validationSchema: buildShareProductValidationSchema(),
    reValidateMode: 'onBlur',
    mode: 'onBlur'
  });

  const body = watch(Fields.body, '');
  const { isSubmitting } = formState;

  const onTxFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err));
    // TODO show a failure message
    onClose()
  };

  const onTxSuccess: TxCallback = () => {
    // TODO show a success message
    onClose()
  };

  const newTxParams = (hash: IpfsCid) => {
    return [ storefrontId, 0, extension, new IpfsContent(hash) ];
  };

  const renderTxButton = () => nonEmptyArr(storefrontIds)
    ? <TxButton
      type='primary'
      label={`Create a product`}
      disabled={isSubmitting}
      params={() => getTxParams({
        json: { body },
        buildTxParamsCallback: newTxParams,
        setIpfsCid,
        ipfs
      })}
      tx={'products.createProduct'}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
      successMessage='Shared to your storefront'
      failedMessage='Failed to share'
    />
    : <CreateStorefrontButton>Create my first storefront</CreateStorefrontButton>

  const renderShareView = () => {
    if (isEmptyArray(storefrontIds)) {
      return <NoData description='You need to have at least one storefront to share product'/>
    }

    return <div className={modalStyles.DfProductActionModalBody}>
      <span className={modalStyles.DfProductActionModalSelector}>
        <SelectStorefrontPreview
          storefrontIds={storefrontIds || []}
          onSelect={saveStorefront}
          imageSize={24}
          defaultValue={storefrontId?.toString()}
        />
      </span>

      <form style={{margin: '0.75rem 0'}}>
        <Controller
          control={control}
          as={<DfMdEditor />}
          options={{ autofocus: true }}
          name={Fields.body}
          value={body}
          className={`${errors[Fields.body] && 'error'} ${styles.DfShareModalMdEditor}`}
        />
        <div className='DfError'>
          <ErrorMessage errors={errors} name={Fields.body} />
        </div>
      </form>
      <DynamicProductPreview id={productId} asRegularProduct />
    </div>
  };

  const saveStorefront = (value: string | number | LabeledValue) => {
    setStorefrontId(new BN(value as string));
  };

  return <Modal
    onCancel={onClose}
    visible={open}
    title={'Share product'}
    className={modalStyles.DfProductActionModal}
    footer={
      <>
        <Button onClick={onClose}>Cancel</Button>
        {renderTxButton()}
      </>
    }
  >
    {renderShareView()}
  </Modal>
}

export const ShareModal = withMulti(
  InnerShareModal,
  withMyAccount,
  withCalls<Props>(
    storefrontsQueryToProp(`storefrontIdsByOwner`, { paramName: 'address', propName: 'storefrontIds' })
  )
);
