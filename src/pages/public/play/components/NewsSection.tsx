import React from "react";
import { TextUtils } from "@idleclient/utils/TextUtils.tsx";

interface NewsPost {
    title: string;
    content: string | React.ReactNode;
    type: string;
    date: string;
    link?: {
        name: string;
        link: string;
    };
    className?: string;
}

interface NewsSectionProps {
    newsPosts: NewsPost[];
}

const NewsSection: React.FC<NewsSectionProps> = ({ newsPosts }) => {
    return (
        <div className="flex flex-col md:items-center lg:flex-row px-4">
            <div className="w-full md:w-2/3 lg:w-full h-full flex flex-col bg-ic-dark-600 space-y-2">
                {/* News container */}
                <div className="grid grid-cols-1 gap-4 p-4">
                    {newsPosts.map((post, index) => (
                        <div
                            key={index}
                            className={`flex flex-col space-y-1 ${post.className ? post.className : ""} 
                            bg-ic-dark-400 border border-ic-dark-200`}
                        >
                            <div className="px-3 pt-1 font-bold text-lg text-gray-200">
                                {post.title}
                            </div>

                            <div className='h-0.5 mx-2 my-1 bg-ic-dark-100/75'/>

                            <p className="px-3 text-gray-300 grow">
                                {typeof post.content === "string" ? (
                                    TextUtils.getStyledMessage(post.content)
                                ) : post.content}
                            </p>

                            <div className='h-0.5 mx-2 my-1 bg-ic-dark-100/75'/>

                            <div className="flex justify-between px-3 text-gray-400 text-sm">
                                <span>
                                    {post.type}
                                    {post.link && (
                                        <> (<a href={post.link.link} target="_blank" rel="noopener noreferrer"
                                               className="text-gray-300 hover:underline">{post.link.name}</a>)</>
                                    )}
                                </span>
                                <span>{post.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewsSection;