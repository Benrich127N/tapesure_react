export const CUSTOMER_MILESTONES = [1, 5, 10, 25, 50, 100, 250, 500];
export const ORDER_MILESTONES = [1, 5, 10, 25, 50, 100, 250, 500, 1000];
export const DELIVERY_MILESTONES = [1, 10, 25, 50, 100, 250, 500];

export const celebrateMilestone = ({ id, title, message, emoji = "🎉" }) => {
  window.dispatchEvent(
    new CustomEvent("tapesure:milestone", {
      detail: { id, title, message, emoji },
    }),
  );
};
