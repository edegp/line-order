import React from "react";
import { setAxiosError, setPaymentError, store } from "store";
import { Modal, Text } from "@mantine/core";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

const ErrorModal = () => {
  const { axiosError, t, paymentError } = store.getState();
  const reload = async () => {
    store.dispatch(setAxiosError(null));
    await new Promise(() => setTimeout(() => {}, 200));
    location.reload();
    return;
  };
  return (
    <>
      <Modal
        centered
        opened={Boolean(axiosError)}
        onClose={reload}
        title={
          <Text>
            <ExclamationTriangleIcon className='inline' />
            {t?.error.msg001}
          </Text>
        }
        className='
          [&_.close]:bg-transparent
            [&_.close]:text-[#047857]
        '
        closeButtonLabel={t?.error.msg004}
      >
        <Text>{t?.error.msg003}</Text>
        <Text>{`（${t?.error.msg003}：${axiosError}）`}</Text>
      </Modal>
      <Modal
        centered
        opened={Boolean(paymentError)}
        onClose={() => {
          store.dispatch(setPaymentError(null));
          reload();
        }}
        title={
          <Text>
            <ExclamationTriangleIcon className='inline mr-2' />
            {t?.error.msg005}
          </Text>
        }
        classNames={{
          close: "bg-transparent text-[#047857]",
        }}
        closeButtonLabel={t?.error.msg007}
      >
        <Text>{t?.error.msg003}</Text>
        <Text>
          {t?.error.msg006.split(/<br>/).map((p) => (
            <>
              {p}
              <br />
            </>
          ))}
        </Text>
      </Modal>
    </>
  );
};

export default ErrorModal;
