import { useFetchStoreSubscription } from "@/api/wrappers/subscription.wrapper";

type Props = {};

const SubscriptionSettings = ({}: Props) => {
  const { data: subscription, isLoading, error } = useFetchStoreSubscription();

  console.log(subscription);

  return <div>SubscriptionSettings</div>;
};

export default SubscriptionSettings;
