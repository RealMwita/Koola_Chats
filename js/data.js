const MOCK_CHATS = [
    {
        id: 1,
        name: "Alex Rivera",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        lastMessage: "I've sent over the final designs for th...",
        time: "10:45 AM",
        unread: 2,
        isOnline: true,
        readStatus: null 
    },
    {
        id: 2,
        name: "Sarah Chen",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026703d",
        lastMessage: "That works for me. See you at the coff...",
        time: "09:12 AM",
        unread: 0,
        isOnline: false,
        readStatus: "read" 
    },
    {
        id: 3,
        name: "Design Group",
        avatar: "", 
        initials: "DG",
        lastMessage: "Marco: Let's review the moodboard tomo...",
        time: "Yesterday",
        unread: 0,
        isOnline: false,
        readStatus: null
    },
    {
        id: 4,
        name: "Jamie Vance",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        lastMessage: "Can you send the link again?",
        time: "Yesterday",
        unread: 1,
        isOnline: false,
        readStatus: null
    },
    {
        id: 5,
        name: "Elena Rodriguez",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026702d",
        lastMessage: "Missed audio call",
        time: "Monday",
        unread: 0,
        isOnline: false,
        readStatus: "missed_call"
    },
    {
        id: 6,
        name: "The Architects",
        avatar: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        lastMessage: "Photo",
        time: "Sunday",
        unread: 0,
        isOnline: false,
        type: "image",
        readStatus: null
    }
];

const MOCK_CALLS = [
    {
        id: 1,
        name: "Sarah Jenkins",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026703d",
        type: "incoming",
        time: "Today, 10:45 AM",
        callType: "audio"
    },
    {
        id: 2,
        name: "Marcus Wright",
        avatar: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
        type: "missed",
        time: "Today, 09:12 AM",
        callType: "video"
    },
    {
        id: 3,
        name: "Product Team Sync",
        avatar: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        type: "missed",
        time: "Yesterday, 4:20 PM",
        callType: "video"
    },
    {
        id: 4,
        name: "Elena Gomez",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026702d",
        type: "incoming",
        time: "October 24, 11:30 AM",
        callType: "audio"
    },
    {
        id: 5,
        name: "Design Group",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        type: "outgoing",
        time: "October 20, 08:15 AM",
        callType: "video"
    }
];

const MOCK_STATUS = [
    {
        id: 1,
        name: "Jamie Vance",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        time: "Today, 10:20 AM",
        viewed: false
    },
    {
        id: 2,
        name: "Sarah Chen",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026703d",
        time: "Today, 08:30 AM",
        viewed: true
    },
    {
        id: 3,
        name: "Elena Rodriguez",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026702d",
        time: "Yesterday, 11:45 PM",
        viewed: true
    }
];

const MOCK_MESSAGES = {
    1: [ // Alex Rivera
        { id: 1, sender: "them", text: "Hey! Just wanted to follow up on the UI kit.", time: "10:30 AM" },
        { id: 2, sender: "me", text: "Hi Alex! Yes, I'm reviewing it now. It looks great.", time: "10:35 AM" },
        { id: 3, sender: "them", text: "I've sent over the final designs for the new Koola Chats app.", time: "10:45 AM" }
    ],
    2: [ // Sarah Chen
        { id: 1, sender: "me", text: "Are we still on for tomorrow?", time: "09:10 AM" },
        { id: 2, sender: "them", text: "That works for me. See you at the coffee shop!", time: "09:12 AM" }
    ],
    3: [ // Design Group
        { id: 1, sender: "them", name: "Marco", text: "Let's review the moodboard tomorrow.", time: "Yesterday, 4:00 PM" }
    ]
};
