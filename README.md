I'm a little sus of this app. I found it here.
https://www.linkedin.com/posts/seifabdelaziz_apple-would-never-make-an-imessage-wrapped-activity-7273074524525342721-VGuk/


I wanted to reverse engineer it. Opened up the package and started reviewing the code.

Someone els ealso recomneded doing this in the post.

```
View Taha Rana’s profile
Taha Rana
 • 3rd+
Software Engineering Intern and CS Student
3d

This is genuinely so cool, is the code open source?

Like

Reply
1 Reply
1 Comment on Taha Rana’s comment
View ‮grebnetyoR ‮neB‭’s profile
‮grebnetyoR ‮neB‭
 • 3rd+
‮rehcraeseR ytiruceS
(edited)
9m

Taha Rana, it basically is open source. Just unpack the dmg that the app ships in, unpack the asar package, and look in the `@messages-wrapped` resource under `node_modules` (most interesting stuff is in the `native` directory, specifically the logic that handles the call back to the API endpoint). Lots of uncompiled Rust code ships with this app; great bedtime reading.
```


Another guy pointed out that unusual requests were being made:

```
View Moma Rizva’s profile
Moma Rizva
 • 3rd+
Engineering Student at University of Houston
4h

Hey Seif! I used Proxyman to inspect the requests being sent from the app and saw one that goes to `messageswrapped.com/api/upload`- may I ask what is being uploaded? It looks like a binary stream. (not confrontational just curious)

(P.S. If you're open to it, would you consider making the project open source? I think it’d be awesome!) Cheers :)
```

Sure enough, found `api/upload` in this file `messages_wrapped/node_modules/@messages-wrapped/native/native.darwin-arm64.node`.
It was surrounded by mentions of encryption and AddressBook which is even more sus.
I found out that the .node file is an addon for node.js. https://nodejs.org/api/addons.html

---

So I decided to make a sinkhole to intercept the requests.
I added `127.0.0.1 messageswrapped.com` to my `etc/hosts` file.

Next step is to get mitm proxy working.
And to try decompling the .node file.