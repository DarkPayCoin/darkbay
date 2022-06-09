import { notification } from "antd";
import { NotificationPlacement } from "antd/lib/notification";



export const openNotification = (message: string, description: string, placement: NotificationPlacement) => {
    notification.info({
      message: message,
      description:
        description,
      placement,
    });
  };
  
  export default openNotification