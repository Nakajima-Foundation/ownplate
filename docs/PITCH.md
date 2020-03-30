## Inspiration

In order to suppress or mitigate the explosive spread of COVID-19, many states and cities have ordered citizens to shelter-in-place and even ordered non-essential businesses to temporarily close. Although such measures are necessary, they are directly hurting bars and restaurants businesses, and they had no choice but laying off most of their employees. 

It is clear that the fight against COVID-19 will be a long battle, because we have to continue to mitigate it, until an effective vaccine becomes available (~18 months) or the “herd immunity” is established (even longer to avoid the collapse of the healthcare system). 

It means bars and restaurants need to find a new way to provide food services to the public safely in order to survive during this period.

## What we learned

We have interviewed several restaurant owners, and found out that many of them have started to-go services, but they don't know how to use technologies, and still rely on phone calls and papers. This is not only inefficient but also involves various unnecessry contacts:

- customers touch door handles when they come in to pick up
- staffs touch customers' credit cards during the payment processes
- customers touch pens during the payment processes

One alternative is a food delivery service like UberEats and Grubhub, but it involves a third party (which increases the risk of contamination) and requires a very high transaction fee (15% to 30% + credit card fee), which is too expensive for already low-margin food businesses. 

## What it does

We believe that the right solution is the combination of the online order and the curbside pickup, which minimizes the contacts. 

This is why we started the OwnPlate project, an open-source online order system optimized for the curbside food pickup businesses. 

It allows bars and restaurants to take orders online with minimum transaction fee (with Stipe, 2.9% + 30cents), and let customers pick up their food at the curbside quickly without unnessary contacts. 

## How we are building it

We are building this software with Firebase, Vue (Nuxt) and Stripe as an open source project on GitHub, and will make the web service available for free. 

Using this web service, restaurant owners can start offering a minimum-contact, curbside pick-up food service. The only cost is the credit-card transaction fee charrged by Stripe (2.9% + 30 cents). 

In order to use this service, resaurant owners need to:

- Create an account on OwnPlate
- Create an account on Stripe (to receive payment)
- Register a restaurant (or restaurants)
- Add menu items
- Share the URL to the menu page via SNS and homepage

Both restaurants and customers will receive various notifications (such as “a new order came in” or “your food is ready to pick up”) so that the restaurant can offer a stress free customer experience. 

## Accomplishments that we are proud of

We are making a very good progress in applying technologies (especially the real-time notification mechanism of Firebase) to solve this problem, identifying various issues involved in food services and focusing on user experiences for restaurants and their customers. 

## Challenges we ran into

We have five software engineers, but they have day jobs and can work on this project only in the evenings and weekends. 

## What's next for OwnPlate

- April 2020: Start a beta testing with a few restaurants in Seattle
- June 2020: Officially launch it to the restaurants in the United States
- August 2020: Start supporting other countries

Throughout this process, we will continue to add features based on feedback from participating restaurants.
