import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, setAxiosError } from "store";
import { Modal, Button, Group, Text } from "@mantine/core";
import {
  CrossCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

const ErrorModal = () => {
  // eslint-disable-next-line react-redux/useSelector-prefer-selectors
  const { axiosError, t, paymentError } = useSelector(
    (state: RootState) => state
  );
  const dispatch = useDispatch();
  const reload = () => {
    location.reload();
    return;
  };
  return (
    <>
      <Modal
        opened={Boolean(axiosError)}
        onClose={() => {
          dispatch(setAxiosError(null));
          reload();
        }}
        title={
          <>
            <ExclamationTriangleIcon />
            {t.error.msg001}
            <Button onClick={() => dispatch(setAxiosError(null))}>
              <CrossCircledIcon />
            </Button>
          </>
        }
        className="
          [&_.close]:bg-transparent
            [&_.close]:text-[#047857]
        "
        closeButtonLabel={t.error.msg004}
      >
        <Text>{t.error.msg003}</Text>
        <Text>{`（${t.error.msg003}：${axiosError}）`}</Text>
      </Modal>
      <Modal
        opened={Boolean(paymentError)}
        onClose={() => {
          dispatch(setPaymentError(null));
          reload();
        }}
        title={
          <>
            <ExclamationTriangleIcon />
            {t.error.msg005}
            <Button onClick={() => dispatch(setAxiosError(null))}>
              <CrossCircledIcon />
            </Button>
          </>
        }
        classNames={{
          close: {
            background: "transparent",
            color: "#047857",
          },
        }}
        closeButtonLabel={t.error.msg007}
      >
        <Text>{t.error.msg003}</Text>
        <Text>{`（${t.error.msg006}：${axiosError}）`}</Text>
      </Modal>
    </>
  );
};

export default ErrorModal;
